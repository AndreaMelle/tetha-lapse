# tetha-lapse
Programmatic access to Tetha S 360 camera in NodeJS.

Module to access a subset of Tetha S Open Spherical Camera API and shoot time lapses.

Note: current implementation waits for download of image to finish, before allowing to take another a new one. Hence the minimum interval of 15 seconds. I believe it's possible to take pictures almost continuosly without needing to download immediately, but watch out for limited storage space...

https://developers.theta360.com/en/
