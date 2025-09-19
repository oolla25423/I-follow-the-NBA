from django.test import TestCase, Client
from django.urls import reverse
from typing import Dict, Any, Optional
from .models import get_all_teams, get_team_by_id


class TeamModelTests(TestCase):
    """Test cases for team model functions"""
    
    def test_get_all_teams(self):
        """Test that get_all_teams returns a list"""
        teams = get_all_teams()
        self.assertIsInstance(teams, list)
        self.assertGreater(len(teams), 0)
    
    def test_get_team_by_id(self):
        """Test getting a specific team by ID"""
        team: Optional[Dict[str, Any]] = get_team_by_id(1)
        self.assertIsNotNone(team)
        if team is not None:
            self.assertEqual(team['id'], 1)
        
        # Test invalid ID
        invalid_team = get_team_by_id(999)
        self.assertIsNone(invalid_team)


class ViewTests(TestCase):
    """Test cases for application views"""
    
    def test_home_view(self):
        """Test home page loads correctly"""
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)  # type: ignore
        self.assertContains(response, 'I follow the NBA')
    
    def test_preferences_view(self):
        """Test preferences page loads correctly"""
        response = self.client.get(reverse('preferences'))
        self.assertEqual(response.status_code, 200)  # type: ignore
        self.assertContains(response, 'Preferences')
    
    def test_toggle_favorite(self):
        """Test toggle favorite endpoint"""
        response = self.client.post(
            reverse('toggle_favorite'),
            {'team_id': 1},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)  # type: ignore