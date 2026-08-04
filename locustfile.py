from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task
    def check_health(self):
        self.client.get("/health", catch_response=True)
