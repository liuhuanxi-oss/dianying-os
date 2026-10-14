package middleware

import (
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "dyos-go/internal/model"
    jwtpkg "dyos-go/pkg/jwt"

    "github.com/gin-gonic/gin"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

func sessionTestDB(t *testing.T) *gorm.DB {
    t.Helper()
    db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
    if err != nil { t.Fatal(err) }
    sqlDB, err := db.DB()
    if err != nil { t.Fatal(err) }
    sqlDB.SetMaxOpenConns(1)
    t.Cleanup(func(){ _ = sqlDB.Close() })
    if err := db.AutoMigrate(&model.User{}); err != nil { t.Fatal(err) }
    return db
}

func sessionRequest(t *testing.T, db *gorm.DB, role string, userID, merchantID uint) int {
    t.Helper()
    token, err := jwtpkg.Sign(jwtpkg.Claims{UserID:userID, Role:role, MerchantID:merchantID})
    if err != nil { t.Fatal(err) }
    r := gin.New()
    switch role {
    case "admin":
        r.GET("/protected", AdminAuth(), RevalidateSession(db), func(c *gin.Context){c.Status(http.StatusOK)})
    case "merchant":
        r.GET("/protected", MerchantAuth(), RevalidateSession(db), func(c *gin.Context){c.Status(http.StatusOK)})
    }
    req := httptest.NewRequest(http.MethodGet, "/protected", nil)
    req.Header.Set("Authorization", "Bearer "+token)
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)
    return w.Code
}

func TestSessionRevalidationDisabledAndDemoted(t *testing.T) {
    gin.SetMode(gin.TestMode)
    jwtpkg.SetSecret(strings.Repeat("s", 40))
    db := sessionTestDB(t)
    u := model.User{Username:"session-admin", Role:"admin", Status:1}
    if err:=db.Create(&u).Error;err!=nil{t.Fatal(err)}
    if got:=sessionRequest(t,db,"admin",u.ID,0);got!=200{t.Fatalf("active admin %d",got)}
    if err:=db.Model(&u).Update("status",0).Error;err!=nil{t.Fatal(err)}
    if got:=sessionRequest(t,db,"admin",u.ID,0);got!=401{t.Fatalf("disabled admin %d",got)}
    if err:=db.Model(&u).Updates(map[string]interface{}{"status":1,"role":"merchant"}).Error;err!=nil{t.Fatal(err)}
    if got:=sessionRequest(t,db,"admin",u.ID,0);got!=403{t.Fatalf("demoted admin %d",got)}
    if err:=db.Delete(&u).Error;err!=nil{t.Fatal(err)}
    if got:=sessionRequest(t,db,"admin",u.ID,0);got!=401{t.Fatalf("deleted admin %d",got)}
}

func TestSessionRevalidationMerchantTenantChange(t *testing.T) {
    gin.SetMode(gin.TestMode)
    jwtpkg.SetSecret(strings.Repeat("m", 40))
    db:=sessionTestDB(t)
    u:=model.User{Username:"session-merchant",Role:"merchant",Status:1,MerchantID:18}
    if err:=db.Create(&u).Error;err!=nil{t.Fatal(err)}
    if got:=sessionRequest(t,db,"merchant",u.ID,18);got!=200{t.Fatalf("valid merchant %d",got)}
    if err:=db.Model(&u).Update("merchant_id",19).Error;err!=nil{t.Fatal(err)}
    if got:=sessionRequest(t,db,"merchant",u.ID,18);got!=403{t.Fatalf("tenant switched %d",got)}
    if got:=sessionRequest(t,db,"merchant",u.ID,0);got!=403{t.Fatalf("zero-tenant token %d",got)}
}

func TestSessionRevalidationFailsWithoutDB(t *testing.T) {
    gin.SetMode(gin.TestMode)
    jwtpkg.SetSecret(strings.Repeat("d",40))
    if got:=sessionRequest(t,nil,"admin",1,0);got!=503{t.Fatalf("missing DB %d",got)}
}
