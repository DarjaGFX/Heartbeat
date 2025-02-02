FROM python:3.12-alpine
WORKDIR /app
COPY requirements.txt .
# RUN apk update
RUN apk add --no-cache gcc krb5-dev musl-dev
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
EXPOSE 8000
CMD ["fastapi", "run", "app/main.py"]