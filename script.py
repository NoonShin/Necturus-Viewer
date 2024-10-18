import os
import re
import json
import natsort

def rename_files_in_folder(folder_path):
    # Regex to match filenames that start with a number and end with .xml
    number_pattern = re.compile(r'^(\d+).*\.xml$')
    
    # List to store the renamed file numbers (without the .xml extension)
    renamed_files = []

    # Loop through all the files in the folder
    for filename in os.listdir(folder_path):
        # Find the number at the start of the filename for XML files
        match = number_pattern.match(filename)
        
        if match:
            # Extract the number part
            number_part = match.group(1)
            
            # Define the new filename (just the number with .xml extension)
            new_filename = f"{number_part}.xml"
            
            # Get the full path of the original and new file
            old_file_path = os.path.join(folder_path, filename)
            new_file_path = os.path.join(folder_path, new_filename)
            
            # Rename the file
            os.rename(old_file_path, new_file_path)
            
            # Add only the number part (without .xml) to the list
            renamed_files.append(number_part)
            # print(f"Renamed '{filename}' to '{new_filename}'")

    # Sort the file numbers naturally (e.g., 4 comes before 100)
    renamed_files = natsort.natsorted(renamed_files)

    # Convert the sorted list to a minimized JSON array (no newlines or indentation)
    json_object = json.dumps(renamed_files, separators=(',', ':'))
    
    # Save the minimized JSON array to a file
    with open('./files_info.json', "w") as json_file:
        json_file.write(json_object)


if __name__ == "__main__":
    folder_path = './files/xml/'
    rename_files_in_folder(folder_path)