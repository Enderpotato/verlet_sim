## Verlet Physics Simulation

Hi this project was made in 2023 around there when i first learnt about the verlet integration technique in solving physics simulations. 
I remember that I saw a video of a guy making a 2D cloth simulation and switching to verlet integration as the system wont leak energy.
Therefore this is a project that expanded on that by adding feature of making your own custom geometry inside the browser.
Sorry I don't remember much as at the time im writting this is in 2025.

This is written in javascript and graphics are powered by p5js javascript library.

Theres different functions:
- Adding point masses with varying mass
- Adding joints which can act as springs or stiff joints
- Toggling gravity
- Toggling drag/air resistance
- Having a wind force in play mode by pressing SHIFT

In play mode, no changes will be saved and everything will revert to the original when going back to edit mode.

(like Scene view and Play mode in a game engine)

There is no collision detection and found some bugs like masses with a joint tend to fall faster but I wont update this project any further.

I'm particularly proud of this project as I implemented the nitpicky details of being able to adjust the scene through an editor (in this case the browser canvas) and found it to be quite enjoyable to interact with it for a short while.
I was still relatively new to coding at that point in time. Bye bye

