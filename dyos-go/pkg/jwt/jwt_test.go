package jwt

import (
    "strings"
    "testing"
    "time"
)

func TestSignRequiresSecret(t *testing.T) {
    original := append([]byte(nil), secretKey...)
    t.Cleanup(func() { secretKey = original })
    secretKey = nil
    if _, err := Sign(Claims{UserID: 1, Role: "admin"}); err == nil {
        t.Fatal("signing must fail without JWT secret")
    }
    if _, err := Verify("aaa.bbb.ccc"); err == nil {
        t.Fatal("verification must fail without JWT secret")
    }
}

func TestSignVerifyAndTamper(t *testing.T) {
    original := append([]byte(nil), secretKey...)
    t.Cleanup(func() { secretKey = original })
    SetSecret(strings.Repeat("s", 40))
    token, err := Sign(Claims{UserID: 7, Role: "merchant", MerchantID: 12})
    if err != nil { t.Fatal(err) }
    claims, err := Verify(token)
    if err != nil { t.Fatal(err) }
    if claims.UserID != 7 || claims.MerchantID != 12 || claims.Role != "merchant" {
        t.Fatalf("unexpected claims: %+v", claims)
    }
    parts := strings.Split(token, ".")
    parts[1] = "eyJ1aWQiOjk5OX0"
    if _, err := Verify(strings.Join(parts, ".")); err == nil {
        t.Fatal("tampered payload must be rejected")
    }
}

func TestExpiredToken(t *testing.T) {
    original := append([]byte(nil), secretKey...)
    t.Cleanup(func() { secretKey = original })
    SetSecret(strings.Repeat("x", 40))
    token, err := Sign(Claims{UserID: 1, Role: "admin", ExpiresAt: time.Now().Add(-time.Hour).Unix()})
    if err != nil { t.Fatal(err) }
    if _, err := Verify(token); err == nil {
        t.Fatal("expired token must be rejected")
    }
}
