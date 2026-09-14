from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthFlowTests(APITestCase):
    def test_register_and_login(self):
        url = reverse('register')
        payload = {
            'username': 'jane',
            'email': 'jane@example.com',
            'password': 'secret123',
            'password2': 'secret123',
        }
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        login = self.client.post(reverse('login'), {
            'username': 'jane', 'password': 'secret123',
        })
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn('access', login.data)
        self.assertIn('user', login.data)