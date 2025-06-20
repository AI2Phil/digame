import unittest
from datetime import datetime
from digame.app.models.notification import Notification # Assuming this is the correct path

class TestNotificationModel(unittest.TestCase):

    def test_create_notification_instance(self):
        """Test creating a Notification model instance."""
        notification_data = {
            "user_id": 1,
            "message": "Test notification message",
            "scheduled_at": datetime.utcnow(),
            "is_read": False
        }

        notification = Notification(
            user_id=notification_data["user_id"],
            message=notification_data["message"],
            scheduled_at=notification_data["scheduled_at"],
            is_read=notification_data["is_read"]
            # created_at will have a default value
        )

        self.assertIsInstance(notification, Notification)
        self.assertEqual(notification.user_id, notification_data["user_id"])
        self.assertEqual(notification.message, notification_data["message"])
        self.assertEqual(notification.scheduled_at, notification_data["scheduled_at"])
        self.assertEqual(notification.is_read, notification_data["is_read"])
        self.assertIsNotNone(notification.created_at)

if __name__ == '__main__':
    unittest.main()
