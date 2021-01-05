import sys
import os

def deleteUserImage():

    PATH_PEOPLE_FOLDERS_LIST = 'images-attendance'

    # checking whether folder exists or not
    if os.path.exists(os.path.join(PATH_PEOPLE_FOLDERS_LIST, sys.argv[1])):
            # removing the file using the os.remove() method
            os.system("rm -rf " + os.path.join(PATH_PEOPLE_FOLDERS_LIST, sys.argv[1]))

deleteUserImage()
