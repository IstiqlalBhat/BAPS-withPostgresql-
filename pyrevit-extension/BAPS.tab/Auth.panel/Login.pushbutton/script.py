# -*- coding: utf-8 -*-
"""Login to BAPS Backend - Authenticate with the procurement system"""
__title__ = 'Login'
__author__ = 'BAPS Team'

from pyrevit import forms, script
import os
import json

# Get config directory
config_dir = os.path.join(os.getenv('APPDATA'), 'BAPS')
if not os.path.exists(config_dir):
    os.makedirs(config_dir)

config_file = os.path.join(config_dir, 'config.json')


def save_token(token, user_data):
    """Save authentication token and user data to local config file"""
    config = {
        'token': token,
        'user': user_data
    }
    with open(config_file, 'w') as f:
        json.dump(config, f)


class LoginWindow(forms.WPFWindow):
    def __init__(self):
        xaml_file = os.path.join(os.path.dirname(__file__), 'Login.xaml')
        forms.WPFWindow.__init__(self, xaml_file)
        self.email = None
        self.password = None

    def login_click(self, sender, args):
        self.email = self.email_tb.Text
        self.password = self.password_pb.Password
        
        # Show waiting status
        import System.Windows
        self.status_tb.Text = "Waiting for authentication on Revit for GC..."
        self.status_tb.Visibility = System.Windows.Visibility.Visible
        self.login_btn.IsEnabled = False
        self.login_btn.Content = "Authenticating..."
        
        # Process UI updates
        import System.Windows.Threading
        System.Windows.Threading.Dispatcher.CurrentDispatcher.Invoke(
            System.Windows.Threading.DispatcherPriority.Background,
            System.Action(lambda: None)
        )
        
        self.Close()


def main():
    """Main login function"""
    login_window = LoginWindow()
    login_window.show_dialog()
    
    if login_window.email and login_window.password:
        email = login_window.email
        password = login_window.password
        # Import API client
        try:
            import sys
            lib_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'lib')
            if lib_path not in sys.path:
                sys.path.insert(0, lib_path)
            
            from api_client import BAPSClient
            
            # Initialize client and attempt login
            client = BAPSClient()
            result = client.login(email, password)
            
            # Handle both 'token' and 'accessToken' fields
            token = result.get('token') or result.get('accessToken')
            
            if token:
                user_data = result.get('user', {})
                user_role = user_data.get('role')
                
                # Allow all GC-related roles
                if user_role in ['GENERAL_CONTRACTOR', 'GC_USER', 'GC_ADMIN']:
                    save_token(token, user_data)
                    user_email = user_data.get('email', 'User')
                    forms.alert(
                        'Login successful! Welcome {}\\n\\nYou are now authenticated as a General Contractor.'.format(user_email),
                        title='Success'
                    )
                else:
                    forms.alert(
                        'Access Denied\\n\\nYou must be a General Contractor to use this extension.\\n\\nYour role: {}'.format(user_role),
                        title='Access Denied',
                        warn_icon=True
                    )
            else:
                forms.alert(
                    'Login Failed\\n\\nNo authentication token received from server.\\n\\nPlease contact support.',
                    title='Error',
                    warn_icon=True
                )
                
        except Exception as e:
            error_msg = str(e)
            forms.alert(
                'Login Error\n\n{}\n\nPlease check:\n- Your email and password\n- Backend server is running at http://localhost:3001\n- Your account exists'.format(error_msg),
                title='Login Error',
                warn_icon=True
            )


if __name__ == '__main__':
    main()
