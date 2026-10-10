package handler

import (
 "net/http"
 "net/url"
 "os"
 "strings"
)

// allowedWebSocketOrigin prevents arbitrary websites from opening a browser
// WebSocket connection to our API. It does not replace user authentication.
func allowedWebSocketOrigin(r *http.Request) bool {
 origin := r.Header.Get("Origin")
 if origin == "" { return false }
 u,err := url.Parse(origin)
 if err != nil || u.Host=="" || u.Path!="" || u.User!=nil || u.RawQuery!="" || u.Fragment!="" {return false}
 if u.Scheme!="https" && u.Scheme!="http" {return false}
 if origin=="https://os.detian.xin" {return true}
 for _,raw := range strings.Split(os.Getenv("DYOS_WS_ORIGINS"), ",") {
  candidate:=strings.TrimSpace(raw)
  v,e:=url.Parse(candidate)
  if e==nil && v.Host!="" && v.User==nil && v.Path=="" && v.RawQuery=="" && v.Fragment=="" && (v.Scheme=="https" || v.Scheme=="http") && candidate==v.Scheme+"://"+v.Host && origin==candidate {return true}
 }
 return false
}
