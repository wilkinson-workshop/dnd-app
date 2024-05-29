FROM python:3.12 

WORKDIR /app
COPY . .
RUN pip install -U pip
RUN pip install -U .
# git+https://github.com/wilkinson-workshop/dnd-app.git

EXPOSE 80
CMD ["scryer", "start", "--hostname=0.0.0.0", "--port=80"]
