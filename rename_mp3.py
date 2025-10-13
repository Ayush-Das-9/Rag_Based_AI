# import os

# # Set the directory containing your MP3 files
# directory = r"C:\Users\Mohan Kumar\Rag Based AI\Videos"  # Change this to your folder path

# # Get all MP3 files in the directory
# mp3_files = [f for f in os.listdir(directory) if f.lower().endswith('.mp3')]



# # Rename each file with a number prefix
# for i, filename in enumerate(mp3_files, start=1):
#     old_path = os.path.join(directory, filename)
#     new_filename = f"{i}_{filename}"
#     new_path = os.path.join(directory, new_filename)
    
#     # Rename the file
#     os.rename(old_path, new_path)
#     print(f"Renamed: {filename} -> {new_filename}")

# print(f"\nSuccessfully renamed {len(mp3_files)} files!")


import os
import re

# Set the directory containing your MP3 files
directory = r"C:\Users\Mohan Kumar\Rag Based AI\Videos"  # Change this to your folder path

# Get all MP3 files in the directory
mp3_files = [f for f in os.listdir(directory) if f.lower().endswith('.mp3')]


# Rename each file: add number prefix and remove "- Tutorial #X"
for i, filename in enumerate(mp3_files, start=11):
    old_path = os.path.join(directory, filename)
    
    # Remove the .mp3 extension temporarily
    name_without_ext = filename[:-4]
    
    # Remove "- Tutorial #1", "- Tutorial #2", etc.
    # This pattern matches " - Tutorial #" followed by one or more digits
    cleaned_name = re.sub(r'\s*-\s*Tutorial\s*#\d+', '', name_without_ext, flags=re.IGNORECASE)
    
    # Remove any extra spaces
    cleaned_name = cleaned_name.strip()
    
    # Create new filename with number prefix
    new_filename = f"{i}_{cleaned_name}.mp3"
    new_path = os.path.join(directory, new_filename)
    
    # Rename the file
    os.rename(old_path, new_path)
    print(f"Renamed: {filename} -> {new_filename}")

print(f"\nSuccessfully renamed {len(mp3_files)} files!")