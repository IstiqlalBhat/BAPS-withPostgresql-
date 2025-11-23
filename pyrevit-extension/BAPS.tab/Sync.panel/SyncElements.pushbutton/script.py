# -*- coding: utf-8 -*-
"""Sync Building Elements to Backend - Extract and upload BIM data"""
__title__ = 'Sync\nElements'
__author__ = 'BAPS Team'

from pyrevit import forms, revit, DB
import os
import json
import sys
import time

# Add lib path for imports
lib_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'lib')
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from element_extractor import ElementExtractor
from schedule_extractor import ScheduleExtractor
from api_client import BAPSClient


def get_auth_token():
    """Get stored authentication token from config file"""
    config_file = os.path.join(os.getenv('APPDATA'), 'BAPS', 'config.json')
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
                token = config.get('token')
                timestamp = config.get('timestamp', 0)

                # Check if token is older than 24 hours (86400 seconds)
                age_seconds = time.time() - timestamp
                if age_seconds > 86400:
                    # Token is older than 24 hours, clear it
                    clear_auth_token()
                    return None

                return token
        except:
            return None
    return None


def clear_auth_token():
    """Clear stored authentication token"""
    config_file = os.path.join(os.getenv('APPDATA'), 'BAPS', 'config.json')
    if os.path.exists(config_file):
        try:
            os.remove(config_file)
        except:
            pass


def convert_schedule_to_elements(schedule_data):
    """Convert schedule data to element format for API"""
    elements = []

    schedule_name = schedule_data.get('schedule_name', 'Unknown Schedule')
    rows = schedule_data.get('data', [])
    headers = schedule_data.get('headers', [])

    for idx, row in enumerate(rows):
        # Create element from each row in schedule
        element = {
            'revitId': '{}_{}'.format(schedule_name, idx),
            'name': '{} - Row {}'.format(schedule_name, idx + 1),
            'category': 'Schedule',
            'quantity': 1.0,
            'unit': 'Item',
            'properties': {},
            'bimMetadata': {
                'schedule_name': schedule_name,
                'row_index': idx + 1
            }
        }

        # Map row data to properties using headers as keys
        for col_idx, header in enumerate(headers):
            if col_idx < len(row):
                element['properties'][header] = row[col_idx]

        elements.append(element)

    return elements


def main():
    """Main sync function - Extract and upload elements to backend"""
    # Check authentication
    token = get_auth_token()
    if not token:
        forms.alert('Please login first using the Login button', exitscript=True)
    
    # Get active Revit document
    doc = revit.doc
    if not doc:
        forms.alert('No active Revit document found', exitscript=True)
    
    # Initialize element extractor
    extractor = ElementExtractor(doc)
    
    # Ask user what element types to sync
    options = ['Walls', 'Doors', 'Windows', 'Structural Framing', 'Schedules', 'All Elements']
    selected = forms.SelectFromList.show(
        options,
        title='Select Elements to Sync',
        multiselect=True,
        button_name='Sync'
    )
    
    if not selected:
        forms.alert('No elements selected', exitscript=True)
    
    # Extract selected elements
    all_elements = []

    with forms.ProgressBar(title='Extracting Elements from Revit...') as pb:
        if 'All Elements' in selected or 'Walls' in selected:
            pb.update_progress(0, 100)
            walls = extractor.extract_walls()
            all_elements.extend(walls)

        if 'All Elements' in selected or 'Doors' in selected:
            pb.update_progress(20, 100)
            doors = extractor.extract_doors()
            all_elements.extend(doors)

        if 'All Elements' in selected or 'Windows' in selected:
            pb.update_progress(40, 100)
            windows = extractor.extract_windows()
            all_elements.extend(windows)

        if 'All Elements' in selected or 'Structural Framing' in selected:
            pb.update_progress(60, 100)
            framing = extractor.extract_structural()
            all_elements.extend(framing)

        if 'All Elements' in selected or 'Schedules' in selected:
            pb.update_progress(80, 100)
            schedule_extractor = ScheduleExtractor(doc)
            all_schedules = schedule_extractor.extract_all_schedules_data()

            for schedule_data in all_schedules:
                schedule_elements = convert_schedule_to_elements(schedule_data)
                all_elements.extend(schedule_elements)
    
    if not all_elements:
        forms.alert('No elements found in the model', exitscript=True)
    
    # Send elements to backend API
    client = BAPSClient(token=token)

    with forms.ProgressBar(title='Syncing {} Elements to Backend...'.format(len(all_elements))) as pb:
        try:
            pb.update_progress(0, 100)
            # Send all elements in a single batch request for better performance
            response = client.create_elements_batch(all_elements)

            forms.alert(
                'Successfully synced {} elements to BAPS!'.format(len(all_elements)),
                title='Sync Complete'
            )
        except Exception as e:
            error_msg = str(e)
            # Check if it's an authentication error
            if 'Unauthorized' in error_msg or '401' in error_msg or 'Invalid token' in error_msg or 'expired' in error_msg.lower():
                # Clear the invalid token
                clear_auth_token()
                forms.alert(
                    'Your authentication session has expired.\n\nPlease login again using the Login button.',
                    title='Session Expired',
                    warn_icon=True
                )
            else:
                forms.alert(
                    'Error syncing elements: {}'.format(error_msg),
                    title='Sync Error',
                    warn_icon=True
                )


if __name__ == '__main__':
    main()
