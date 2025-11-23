# -*- coding: utf-8 -*-
"""Schedule Extractor for Revit - Extract data from BIM schedules"""

from Autodesk.Revit.DB import *


class ScheduleExtractor:
    """Extract schedule data from Revit"""

    def __init__(self, doc):
        self.doc = doc

    def get_all_schedules(self):
        """Get all schedules in the document"""
        collector = FilteredElementCollector(self.doc)
        schedules = []

        # Get all view schedules
        for view in collector.OfClass(ViewSchedule):
            if view.IsTemplate is False:
                schedule_name = view.Name
                schedules.append({
                    'name': schedule_name,
                    'id': str(view.Id),
                    'element_id': view.Id
                })

        return schedules

    def extract_schedule_data(self, schedule_view):
        """Extract data from a specific schedule"""
        try:
            table_data = schedule_view.GetTableData()
            section_data = table_data.GetSectionData(SectionType.Body)

            if not section_data:
                return None

            rows = section_data.NumberOfRows
            cols = section_data.NumberOfColumns

            schedule_data = {
                'schedule_name': schedule_view.Name,
                'rows': rows,
                'columns': cols,
                'headers': [],
                'data': []
            }

            # Extract headers (column names)
            for col_index in range(cols):
                try:
                    cell = section_data.Cells.get_Item(0, col_index)
                    header = cell.Text if cell else 'Column_{}'.format(col_index)
                    schedule_data['headers'].append(header)
                except:
                    schedule_data['headers'].append('Column_{}'.format(col_index))

            # Extract data rows (skip header row, start from 1)
            for row_index in range(1, rows):
                row_data = []
                for col_index in range(cols):
                    try:
                        cell = section_data.Cells.get_Item(row_index, col_index)
                        cell_value = cell.Text if cell else ''
                        row_data.append(cell_value)
                    except:
                        row_data.append('')

                schedule_data['data'].append(row_data)

            return schedule_data

        except Exception as e:
            return None

    def extract_all_schedules_data(self):
        """Extract data from all schedules in document"""
        schedules = self.get_all_schedules()
        all_data = []

        for schedule_info in schedules:
            try:
                schedule_view = self.doc.GetElement(schedule_info['element_id'])
                if schedule_view:
                    data = self.extract_schedule_data(schedule_view)
                    if data:
                        all_data.append(data)
            except:
                pass

        return all_data

    def schedule_to_dict_list(self, schedule_data):
        """Convert schedule table data to list of dictionaries"""
        if not schedule_data or not schedule_data.get('data'):
            return []

        headers = schedule_data.get('headers', [])
        data_rows = schedule_data.get('data', [])

        result = []
        for row in data_rows:
            row_dict = {}
            for i, header in enumerate(headers):
                value = row[i] if i < len(row) else ''
                row_dict[header] = value
            result.append(row_dict)

        return result
