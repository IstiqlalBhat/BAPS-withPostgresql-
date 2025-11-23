# -*- coding: utf-8 -*-
"""Show Current Authentication Status - Display GC authentication and user information"""
__title__ = 'Auth Status'
__author__ = 'BAPS Team'

from pyrevit import forms, script
import os
import json
import System.Windows
import time
from datetime import datetime, timedelta

# Get config file path
config_dir = os.path.join(os.getenv('APPDATA'), 'BAPS')
config_file = os.path.join(config_dir, 'config.json')


def load_auth_status():
    """Load authentication status from config file"""
    if not os.path.exists(config_file):
        return None

    try:
        with open(config_file, 'r') as f:
            config = json.load(f)
        return config
    except Exception, e:
        return None


def clear_auth():
    """Clear authentication token"""
    if os.path.exists(config_file):
        try:
            os.remove(config_file)
            return True
        except:
            return False
    return True


class AuthStatusWindow(forms.WPFWindow):
    def __init__(self):
        xaml_file = os.path.join(os.path.dirname(__file__), 'AuthStatus.xaml')
        forms.WPFWindow.__init__(self, xaml_file)
        self.is_authenticated = False
        self.logout_btn.Click += self.logout_click
        self.close_btn.Click += self.close_click
        self.load_status()

    def load_status(self):
        """Load and display authentication status"""
        auth_data = load_auth_status()

        if auth_data and auth_data.get('token'):
            self.is_authenticated = True
            user_data = auth_data.get('user', {})
            email = user_data.get('email', 'Unknown')
            role = user_data.get('role', 'Unknown')
            timestamp = auth_data.get('timestamp', 0)

            # Set status indicator (green)
            self.status_indicator.Fill = System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(255, 40, 167, 69))
            self.status_text.Text = "Authenticated"
            self.status_detail.Text = "Data transfer ready"

            # Set user info
            self.email_text.Text = email
            self.role_text.Text = role

            # Calculate token expiration (24 hours from login)
            expiration_time = datetime.fromtimestamp(timestamp) + timedelta(hours=24)
            hours_remaining = (expiration_time - datetime.now()).total_seconds() / 3600

            if hours_remaining > 0:
                self.token_status.Text = "Valid token. Expires in {:.1f} hours.".format(hours_remaining)
            else:
                self.token_status.Text = "Token expired. Please login again."

            # Enable logout button
            self.logout_btn.IsEnabled = True
        else:
            # Not authenticated
            self.status_indicator.Fill = System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(255, 220, 53, 69))
            self.status_text.Text = "Not Authenticated"
            self.status_detail.Text = "Please login first"

            self.email_text.Text = "No user logged in"
            self.role_text.Text = "N/A"

            self.token_status.Text = "No authentication token found. Click 'Login to BAPS' to authenticate."

            # Disable logout button
            self.logout_btn.IsEnabled = False

    def logout_click(self, sender, args):
        """Handle logout"""
        result = forms.ask_for_confirmation(
            'Are you sure you want to logout?',
            'This will clear your authentication token.'
        )

        if result:
            if clear_auth():
                forms.alert(
                    'Logout successful.\n\nYou have been logged out.\n\nPlease login again to continue.',
                    title='Logout'
                )
                self.is_authenticated = False
                self.load_status()
            else:
                forms.alert(
                    'Failed to clear authentication.\n\nPlease try again.',
                    title='Error',
                    warn_icon=True
                )

    def close_click(self, sender, args):
        """Close the window"""
        self.Close()


def main():
    """Main function"""
    window = AuthStatusWindow()
    window.show_dialog()


if __name__ == '__main__':
    main()
