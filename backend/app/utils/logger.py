import logging
import sys
import os

# Go up two levels from utils -> app -> backend, then join with 'tracker.log'
# This ensures the log file is always created in the 'backend' directory.
LOG_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'tracker.log')

# Get the logger
logger = logging.getLogger(__name__)

# Prevent handlers from being added multiple times in case of re-imports
if not logger.handlers:
    logger.setLevel(logging.INFO)

    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S')

    # Create a file handler to write logs to a file
    file_handler = logging.FileHandler(LOG_FILE_PATH)
    file_handler.setFormatter(formatter)

    # Create a stream handler to print logs to the console
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)

    # Add handlers to the logger
    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)