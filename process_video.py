import os 

files = os.listdir("videos")
for file in files:
    tutorial_number = file.split(" [")[0].split(" #")[1]
    file_name = file.split(" | ")[0]
    print(tutorial_number, file_name)