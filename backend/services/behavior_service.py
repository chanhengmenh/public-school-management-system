"""
Behavior Analytics Service
Processes behavior logs to compute typing metrics and engagement analytics
"""
from typing import List, Dict, Any
from datetime import datetime
import json


class BehaviorAnalyticsService:
    """Service for analyzing student input behavior during assignment submission"""
    
    @staticmethod
    def calculate_typing_speed(keystroke_events: List[Dict[str, Any]]) -> float:
        """
        Calculate typing speed in words per minute (WPM)
        
        Args:
            keystroke_events: List of keystroke events with timestamps
            
        Returns:
            Typing speed in WPM
        """
        if len(keystroke_events) < 2:
            return 0.0
        
        # Get first and last keystroke timestamps
        first_event = min(keystroke_events, key=lambda x: x['timestamp'])
        last_event = max(keystroke_events, key=lambda x: x['timestamp'])
        
        # Calculate time difference in minutes
        time_diff = (last_event['timestamp'] - first_event['timestamp']).total_seconds() / 60
        
        if time_diff == 0:
            return 0.0
        
        # Count total characters typed
        total_chars = sum(event.get('payload', {}).get('char_count', 1) for event in keystroke_events)
        
        # Average word length is 5 characters
        words = total_chars / 5
        wpm = words / time_diff if time_diff > 0 else 0
        
        return round(wpm, 2)
    
    @staticmethod
    def calculate_paste_ratio(keystroke_count: int, paste_events: List[Dict[str, Any]]) -> float:
        """
        Calculate the ratio of pasted content to total content
        
        Args:
            keystroke_count: Number of keystroke events
            paste_events: List of paste events
            
        Returns:
            Paste ratio as percentage (0-100)
        """
        total_pasted_chars = sum(
            event.get('payload', {}).get('pasted_length', 0) 
            for event in paste_events
        )
        
        total_chars = keystroke_count + total_pasted_chars
        
        if total_chars == 0:
            return 0.0
        
        return round((total_pasted_chars / total_chars) * 100, 2)
    
    @staticmethod
    def calculate_active_time(focus_events: List[Dict[str, Any]], 
                             blur_events: List[Dict[str, Any]]) -> float:
        """
        Calculate total active engagement time in seconds
        
        Args:
            focus_events: List of focus events
            blur_events: List of blur events
            
        Returns:
            Active time in seconds
        """
        if not focus_events:
            return 0.0
        
        total_active_seconds = 0.0
        
        # Pair focus and blur events
        for i, focus_event in enumerate(focus_events):
            focus_time = focus_event['timestamp']
            
            # Find corresponding blur event
            blur_time = None
            for blur_event in blur_events:
                if blur_event['timestamp'] > focus_time:
                    blur_time = blur_event['timestamp']
                    break
            
            # If no blur event found, use current time or next focus
            if blur_time is None:
                if i + 1 < len(focus_events):
                    blur_time = focus_events[i + 1]['timestamp']
                else:
                    blur_time = datetime.utcnow()
            
            total_active_seconds += (blur_time - focus_time).total_seconds()
        
        return round(total_active_seconds, 2)
    
    @staticmethod
    def classify_input_mode(paste_ratio: float) -> str:
        """
        Classify input mode based on paste ratio
        
        Args:
            paste_ratio: Percentage of pasted content
            
        Returns:
            Input mode: "typed", "pasted", or "mixed"
        """
        if paste_ratio < 10:
            return "typed"
        elif paste_ratio > 70:
            return "pasted"
        else:
            return "mixed"
    
    @staticmethod
    def analyze_submission_behavior(behavior_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze all behavior logs for a submission and compute metrics
        
        Args:
            behavior_logs: List of all behavior events for a submission
            
        Returns:
            Dictionary with computed analytics
        """
        # Separate events by type
        keystroke_events = [e for e in behavior_logs if e['event_type'] == 'keystroke']
        paste_events = [e for e in behavior_logs if e['event_type'] == 'paste']
        focus_events = [e for e in behavior_logs if e['event_type'] == 'focus']
        blur_events = [e for e in behavior_logs if e['event_type'] == 'blur']
        
        # Calculate metrics
        typing_speed = BehaviorAnalyticsService.calculate_typing_speed(keystroke_events)
        paste_ratio = BehaviorAnalyticsService.calculate_paste_ratio(
            len(keystroke_events), 
            paste_events
        )
        active_time = BehaviorAnalyticsService.calculate_active_time(
            focus_events, 
            blur_events
        )
        input_mode = BehaviorAnalyticsService.classify_input_mode(paste_ratio)
        
        return {
            "total_keystrokes": len(keystroke_events),
            "total_pastes": len(paste_events),
            "typing_speed_wpm": typing_speed,
            "paste_ratio": paste_ratio,
            "active_time_seconds": active_time,
            "input_mode": input_mode
        }
