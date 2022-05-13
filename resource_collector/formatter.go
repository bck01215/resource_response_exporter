package main

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"github.com/sirupsen/logrus"
)

type Results struct {
	FailedToLoad int `json:"failed"`
	Log          Log `json:"log"`
}
type Log struct {
	Resources []Resource `json:"entries"`
}
type Resource struct {
	Timing    Timing   `json:"timings"`
	TotalTime int      `json:"time"`
	Request   Request  `json:"request"`
	Response  Response `json:"response"`
}
type Request struct {
	URL string `json:"url"`
}
type Response struct {
	Status  int     `json:"status"`
	Content Content `json:"content"`
}
type Content struct {
	Size int    `json:"size"`
	Type string `json:"mimeType"`
}

type Timing struct {
	Wait    int `json:"wait"`
	Send    int `json:"send"`
	Receive int `json:"receive"`
}

func return_json(target string) []Resource {
	set_config(target)
	return get_export_data(target + ".json").Log.Resources
}

func get_export_data(file string) Results {
	var results Results
	jsonFile, err := os.Open(file)
	if err != nil {
		logrus.Error(err)
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	json.Unmarshal(byteValue, &results)
	logrus.Info(results.Log.Resources[0])
	return results

}
