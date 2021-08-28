package main

import (
	"encoding/json"
	"net/http"
	"path"

	"github.com/sirupsen/logrus"
)

func do_stuff(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	target := r.URL.Query().Get("target")
	result, err := json.Marshal(return_json(target))
	if err != nil {
		logrus.Fatal(err)
		return
	}
	w.Write(result)

}

func main() {
	logrus.Info("Starting exporter")
	http.HandleFunc(path.Join("/probe"), func(w http.ResponseWriter, r *http.Request) {
		do_stuff(w, r)
	})

	logrus.Fatal(http.ListenAndServe(":9101", nil))

}
