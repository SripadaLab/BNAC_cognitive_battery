rad2deg = function(rad) {
  (rad*180)/pi
}
deg2pix = function(h,d,r,cpd) {
  deg_per_px = rad2deg(atan2(.5*h,d))/(0.5*r)
  cpp = cpd * deg_per_px
  cpp
}
pix2deg = function(h,d,r,cpp) {
  deg_per_px = rad2deg(atan2(.5*h,d))/(0.5*r)
  cpd = cpp / deg_per_px
  cpd
}
deg2pix(13.25,26,1440,2)

pix2deg(13.25,26,1440,0.025)

h = 13.25
d = 26
r = 1440
1/(rad2deg(atan2(0.5*h,d))/(0.5*r))

h = 12
d = 25
r = 1080
1/(rad2deg(atan2(0.5*h,d))/(0.5*r))


#so let's assume 40 pixels per degree
ppd = 40
cpd = 3
cpp = cpd/ppd
cpp
