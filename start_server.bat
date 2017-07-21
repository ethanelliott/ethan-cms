@echo off
echo Starting Server...
cd "C:\MONGO\bin"
start cmd /c mongod --dbpath "D:\repos\EthanDesigns CMS\data"
start cmd /c mongo
cd "D:\repos\EthanDesigns CMS"
nodemon
pause
