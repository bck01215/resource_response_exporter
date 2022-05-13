FROM bkauffman7/resource_collector:v1
COPY . /app
VOLUME ["/app"]
WORKDIR /app/resource_collector
RUN go build && mv -f resource_collector /resource_collector
EXPOSE 9101
ENTRYPOINT ["/resource_collector"]