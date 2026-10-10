package handler

import (
 "net/http/httptest"
 "testing"
)

func TestAllowedWebSocketOrigin(t *testing.T) {
 t.Setenv("DYOS_WS_ORIGINS","https://partner.example")
 for _,tc:=range []struct{origin string;want bool}{
  {"https://os.detian.xin",true},
  {"https://partner.example",true},
  {"https://evil.example",false},
  {"https://os.detian.xin.evil.example",false},
  {"null",false},
  {"",false},
 } {
  req:=httptest.NewRequest("GET","/ws/screen",nil)
  if tc.origin!="" {req.Header.Set("Origin",tc.origin)}
  if got:=allowedWebSocketOrigin(req);got!=tc.want {t.Errorf("%q: got %v want %v",tc.origin,got,tc.want)}
 }
}
