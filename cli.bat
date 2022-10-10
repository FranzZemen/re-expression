@echo off
IF %1 EQU exp (node publish/cli %1=%2) ELSE (node publish/cli %1)

