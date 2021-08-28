package main

import (
	"flag"
	"io/ioutil"
	"os"
	"os/exec"

	"github.com/sirupsen/logrus"
	"gopkg.in/yaml.v2"
)

type Config struct {
	Connection string `yaml:"connection"`
	URL        string `yaml:"url"`
	Timeout    string `yaml:"timeout"`
}

type Websites struct {
	Configs []Config `yaml:"websites"`
}

var location = flag.String("config-file",
	os.Getenv("PWD")+"/config.yaml",
	"Path to configuration file")

func phantom(phantomArgs ...string) {
	err := exec.Command("phantomjs", phantomArgs...).Run()
	if err != nil {
		logrus.Error(err)
	}

}

func get_yaml(conf_file string) Websites {
	yamlFile, err := ioutil.ReadFile(conf_file)
	if err != nil {
		logrus.Error("Error reading YAML file: ", err)
		os.Exit(1)
	}
	var yamlConfig Websites
	err = yaml.Unmarshal(yamlFile, &yamlConfig)
	if err != nil {
		logrus.Error("Error reading YAML file: ", err)
		os.Exit(1)
	}
	return yamlConfig
}

func set_config(name string) {
	configs := get_yaml(*location)
	for _, conf := range configs.Configs {
		if conf.Connection == name {
			phantom("netsniff.js", conf.URL, conf.Timeout, name+".json")
		}
	}

}
