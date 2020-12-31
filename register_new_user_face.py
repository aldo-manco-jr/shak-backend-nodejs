import sys
import os
from urllib import request

def setUserFace():

    URL = sys.argv[1]
    # URL = "https://res.cloudinary.com/dfn8llckr/image/upload/v1601987890/hsv9jhg9wm78ttrtgspx.jpg"

    PATH_PEOPLE_FOLDERS_LIST = 'images-attendance'

    os.mkdir(os.path.join(PATH_PEOPLE_FOLDERS_LIST, sys.argv[2]))

    f = open(os.path.join(PATH_PEOPLE_FOLDERS_LIST, sys.argv[2]) + '/photo_to_analyze.jpg', 'wb')
    f.write(request.urlopen(URL).read())
    f.close()

setUserFace()
