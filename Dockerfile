FROM golang:1.16
RUN apt-get update -y && apt-get upgrade -y && apt-get install phantomjs -y
ENV QT_QPA_PLATFORM=offscreen
RUN mkdir -p /app
COPY . /app
VOLUME ["/app"]
WORKDIR /app/resource_collector
RUN go build && mv resource_collector /
EXPOSE 9101
ENTRYPOINT ["/resource_collector"]⏎                                                                                                                                                                              