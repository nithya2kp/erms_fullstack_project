from rest_framework.exceptions import APIException

class ERMSException(APIException):
    def __init__(self, status_code, detail):
        self.status_code = status_code
        self.detail = detail