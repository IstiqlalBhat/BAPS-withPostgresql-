# -*- coding: utf-8 -*-
"""Element Extractor for Revit BIM Data"""

from Autodesk.Revit.DB import *


class ElementExtractor:
    """Extract element data from Revit document"""
    
    def __init__(self, doc):
        self.doc = doc
    
    def _get_parameter_value(self, element, param_name):
        """Safely get parameter value"""
        try:
            param = element.LookupParameter(param_name)
            if param and param.HasValue:
                if param.StorageType == StorageType.String:
                    return param.AsString()
                elif param.StorageType == StorageType.Double:
                    return param.AsDouble()
                elif param.StorageType == StorageType.Integer:
                    return param.AsInteger()
                elif param.StorageType == StorageType.ElementId:
                    return str(param.AsElementId())
        except:
            pass
        return None
    
    def _extract_element_data(self, element, category_name):
        """Extract common element data"""
        data = {
            'revitId': str(element.Id),
            'name': element.Name if hasattr(element, 'Name') else 'Unnamed',
            'category': category_name,
            'properties': {},
            'bimMetadata': {}
        }
        
        # Get common parameters
        try:
            data['properties']['Mark'] = self._get_parameter_value(element, 'Mark')
            data['properties']['Comments'] = self._get_parameter_value(element, 'Comments')
            data['properties']['Type'] = element.get_Parameter(BuiltInParameter.ELEM_TYPE_PARAM).AsValueString()
            
            # BIM metadata
            data['bimMetadata']['Level'] = self._get_parameter_value(element, 'Level')
            data['bimMetadata']['Phase'] = self._get_parameter_value(element, 'Phase Created')
            
        except:
            pass
        
        return data
    
    def extract_walls(self):
        """Extract wall elements"""
        walls = FilteredElementCollector(self.doc)\
            .OfClass(Wall)\
            .WhereElementIsNotElementType()\
            .ToElements()
        
        result = []
        for wall in walls:
            data = self._extract_element_data(wall, 'Walls')
            
            # Wall-specific data
            try:
                data['properties']['Height'] = self._get_parameter_value(wall, 'Unconnected Height')
                data['properties']['Length'] = self._get_parameter_value(wall, 'Length')
                data['properties']['Area'] = self._get_parameter_value(wall, 'Area')
                data['properties']['Volume'] = self._get_parameter_value(wall, 'Volume')
            except:
                pass
            
            result.append(data)
        
        return result
    
    def extract_doors(self):
        """Extract door elements"""
        doors = FilteredElementCollector(self.doc)\
            .OfCategory(BuiltInCategory.OST_Doors)\
            .WhereElementIsNotElementType()\
            .ToElements()
        
        result = []
        for door in doors:
            data = self._extract_element_data(door, 'Doors')
            
            # Door-specific data
            try:
                data['properties']['Width'] = self._get_parameter_value(door, 'Width')
                data['properties']['Height'] = self._get_parameter_value(door, 'Height')
            except:
                pass
            
            result.append(data)
        
        return result
    
    def extract_windows(self):
        """Extract window elements"""
        windows = FilteredElementCollector(self.doc)\
            .OfCategory(BuiltInCategory.OST_Windows)\
            .WhereElementIsNotElementType()\
            .ToElements()
        
        result = []
        for window in windows:
            data = self._extract_element_data(window, 'Windows')
            
            # Window-specific data
            try:
                data['properties']['Width'] = self._get_parameter_value(window, 'Width')
                data['properties']['Height'] = self._get_parameter_value(window, 'Height')
            except:
                pass
            
            result.append(data)
        
        return result
    
    def extract_structural(self):
        """Extract structural framing elements"""
        framing = FilteredElementCollector(self.doc)\
            .OfCategory(BuiltInCategory.OST_StructuralFraming)\
            .WhereElementIsNotElementType()\
            .ToElements()
        
        result = []
        for frame in framing:
            data = self._extract_element_data(frame, 'Structural Framing')
            
            # Structural-specific data
            try:
                data['properties']['Length'] = self._get_parameter_value(frame, 'Length')
                data['properties']['Material'] = self._get_parameter_value(frame, 'Structural Material')
            except:
                pass
            
            result.append(data)
        
        return result
