import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session # Ensure Session is imported
from datetime import datetime
from typing import Generator # For type hinting the fixture

from digame.app.db.base_class import Base  # Adjust if your Base is elsewhere
from digame.app.models.notification import Notification as NotificationModel
from digame.app.schemas.notification_schemas import NotificationCreate
from digame.app.crud import notification_crud # Adjusted import

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestNotificationCrud(unittest.TestCase):

    def setUp(self):
        """Set up the database for each test."""
        Base.metadata.create_all(bind=engine)
        self.db: Session = TestingSessionLocal()

    def tearDown(self):
        """Tear down the database after each test."""
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_create_notification(self):
        """Test creating a notification."""
        notification_data = NotificationCreate(
            user_id=1,
            message="Test CRUD create notification",
            scheduled_at=datetime.utcnow()
        )
        created_notification = notification_crud.create_notification(self.db, notification=notification_data)

        self.assertIsNotNone(created_notification.id)
        self.assertEqual(created_notification.user_id, notification_data.user_id)
        self.assertEqual(created_notification.message, notification_data.message)
        self.assertEqual(created_notification.scheduled_at, notification_data.scheduled_at)
        self.assertFalse(created_notification.is_read) # Default value
        self.assertIsNotNone(created_notification.created_at)

    def test_get_notification(self):
        """Test retrieving a notification by ID."""
        notification_data = NotificationCreate(
            user_id=2,
            message="Test CRUD get notification"
        )
        created_notification = notification_crud.create_notification(self.db, notification=notification_data)

        fetched_notification = notification_crud.get_notification(self.db, notification_id=created_notification.id)

        self.assertIsNotNone(fetched_notification)
        self.assertEqual(fetched_notification.id, created_notification.id)
        self.assertEqual(fetched_notification.message, "Test CRUD get notification")

    def test_get_notification_not_found(self):
        """Test retrieving a non-existent notification."""
        fetched_notification = notification_crud.get_notification(self.db, notification_id=999)
        self.assertIsNone(fetched_notification)

if __name__ == '__main__':
    unittest.main()
