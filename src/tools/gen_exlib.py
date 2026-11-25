"""Generates src/v5/09f-exlib.js: the built-in exercise library.
Edit the lists below and re-run:  python3 src/tools/gen_exlib.py"""
import json, re, os
L = []
def add(muscle, equip, *names):
    for n in names: L.append((n, muscle, equip))

# ---------------- CHEST ----------------
add('Chest','Barbell','Barbell Bench Press','Incline Barbell Bench Press','Decline Barbell Bench Press','Close-Grip Bench Press','Wide-Grip Bench Press','Paused Bench Press','Spoto Press','Floor Press','Pin Press','Reverse-Grip Bench Press','Larsen Press','Guillotine Press')
add('Chest','Dumbbells','Dumbbell Bench Press','Incline Dumbbell Press','Decline Dumbbell Press','Neutral-Grip Dumbbell Press','Single-Arm Dumbbell Bench Press','Dumbbell Floor Press','Dumbbell Fly','Incline Dumbbell Fly','Decline Dumbbell Fly','Dumbbell Squeeze Press','Dumbbell Pullover','Low-Incline Dumbbell Press','Alternating Dumbbell Bench Press')
add('Chest','Machine','Machine Chest Press','Incline Machine Press','Decline Machine Press','Hammer Strength Chest Press','Hammer Strength Incline Press','Pec Deck','Smith Machine Bench Press','Smith Machine Incline Press','Smith Machine Decline Press','Plate-Loaded Chest Press','Seated Dip Machine')
add('Chest','Cable','Cable Fly','High-to-Low Cable Fly','Low-to-High Cable Fly','Single-Arm Cable Fly','Cable Crossover','Seated Cable Fly','Cable Chest Press','Single-Arm Cable Chest Press','Standing Cable Press')
add('Chest','Bodyweight','Press-Up','Incline Press-Up','Decline Press-Up','Wide Press-Up','Diamond Press-Up','Archer Press-Up','Deficit Press-Up','Clap Press-Up','Knee Press-Up','Tempo Press-Up','Weighted Press-Up','Ring Press-Up','Chest Dip','Weighted Chest Dip','Pseudo Planche Press-Up','Spiderman Press-Up','Hindu Press-Up')
add('Chest','Other','Resistance Band Chest Press','Resistance Band Fly','Landmine Press','Kettlebell Floor Press','Svend Press','Medicine Ball Chest Pass')

# ---------------- BACK ----------------
add('Back','Barbell','Deadlift','Barbell Row','Pendlay Row','Yates Row','Seal Row','T-Bar Row','Meadows Row','Rack Pull','Deficit Deadlift','Snatch-Grip Deadlift','Barbell Shrug','Behind-the-Back Barbell Shrug','Good Morning','Underhand Barbell Row')
add('Back','Dumbbells','Single-Arm Dumbbell Row','Chest-Supported Row','Incline Dumbbell Row','Kroc Row','Dumbbell Shrug','Dumbbell Pullover','Renegade Row','Dumbbell Deadlift','Seated Dumbbell Shrug','Two-Arm Bent-Over Dumbbell Row')
add('Back','Machine','Seated Machine Row','Hammer Strength Row','Hammer Strength Iso-Lateral Pulldown','Chest-Supported T-Bar Row','Assisted Pull-Up','Machine Pullover','Low Row Machine','High Row Machine','Smith Machine Row','Smith Machine Shrug','Back Extension','45-Degree Back Extension','Reverse Hyperextension')
add('Back','Cable','Lat Pulldown','Close-Grip Lat Pulldown','Wide-Grip Lat Pulldown','Neutral-Grip Lat Pulldown','Underhand Lat Pulldown','Single-Arm Lat Pulldown','Kneeling Single-Arm Pulldown','Straight-Arm Pulldown','Rope Pullover','Seated Cable Row','Wide-Grip Seated Cable Row','Single-Arm Seated Cable Row','Standing Cable Row','Cable Shrug','Half-Kneeling Cable Row','Face-Away Cable Pullover')
add('Back','Bodyweight','Pull-Up','Chin-Up','Neutral-Grip Pull-Up','Wide-Grip Pull-Up','Weighted Pull-Up','Weighted Chin-Up','Negative Pull-Up','Inverted Row','Feet-Elevated Inverted Row','Ring Row','Scapular Pull-Up','Commando Pull-Up','Superman','Archer Pull-Up','Towel Row','Dead Hang')
add('Back','Other','Resistance Band Row','Resistance Band Pulldown','Band Pull-Apart','Kettlebell Row','Kettlebell Deadlift','Landmine Row','Single-Arm Landmine Row','Trap Bar Deadlift','Trap Bar Shrug','Sandbag Row')

# ---------------- SHOULDERS ----------------
add('Shoulders','Barbell','Overhead Press','Push Press','Seated Barbell Press','Behind-the-Neck Press','Z Press','Barbell Front Raise','Barbell Upright Row','Bradford Press')
add('Shoulders','Dumbbells','Seated Dumbbell Shoulder Press','Standing Dumbbell Shoulder Press','Arnold Press','Single-Arm Dumbbell Press','Dumbbell Lateral Raise','Seated Dumbbell Lateral Raise','Leaning Dumbbell Lateral Raise','Lying Incline Lateral Raise','Dumbbell Front Raise','Alternating Front Raise','Bent-Over Rear Delt Fly','Seated Rear Delt Fly','Chest-Supported Rear Delt Raise','Dumbbell Upright Row','Cuban Press','Dumbbell Y-Raise','Partial Lateral Raise','Lu Raise')
add('Shoulders','Machine','Machine Shoulder Press','Hammer Strength Shoulder Press','Smith Machine Shoulder Press','Machine Lateral Raise','Rear Delt Fly','Reverse Pec Deck','Plate-Loaded Shoulder Press')
add('Shoulders','Cable','Cable Lateral Raise','Behind-the-Back Cable Lateral Raise','Cable Y-Raise','Face Pull','Cable Rear Delt Fly','Single-Arm Cable Rear Delt Fly','Cable Front Raise','Cable Upright Row','Cable External Rotation','Cable Internal Rotation','Cable Shoulder Press')
add('Shoulders','Bodyweight','Pike Press-Up','Feet-Elevated Pike Press-Up','Handstand Press-Up','Wall Walk','Handstand Hold','Prone Y-T-W Raise','Wall Slide')
add('Shoulders','Other','Landmine Shoulder Press','Half-Kneeling Landmine Press','Kettlebell Press','Bottoms-Up Kettlebell Press','Kettlebell Halo','Plate Front Raise','Resistance Band Lateral Raise','Resistance Band Face Pull','Resistance Band External Rotation','Resistance Band Overhead Press')

# ---------------- BICEPS ----------------
add('Biceps','Barbell','Barbell Curl','EZ-Bar Curl','Wide-Grip Barbell Curl','Close-Grip EZ-Bar Curl','Preacher Curl','EZ-Bar Preacher Curl','Drag Curl','Reverse Barbell Curl','Spider Curl (EZ-Bar)','21s Barbell Curl')
add('Biceps','Dumbbells','Dumbbell Curl','Alternating Dumbbell Curl','Hammer Curl','Cross-Body Hammer Curl','Incline Dumbbell Curl','Concentration Curl','Dumbbell Preacher Curl','Spider Curl','Zottman Curl','Seated Dumbbell Curl','Waiter Curl','Bayesian Dumbbell Curl','Supinating Dumbbell Curl')
add('Biceps','Machine','Machine Preacher Curl','Machine Bicep Curl','Plate-Loaded Preacher Curl')
add('Biceps','Cable','Cable Curl','Rope Hammer Curl','Bayesian Cable Curl','Single-Arm Cable Curl','High Cable Curl','Cable Preacher Curl','Lying Cable Curl','Reverse Cable Curl')
add('Biceps','Bodyweight','Chin-Up Hold','Inverted Chin-Up Row','Towel Bicep Curl')
add('Biceps','Other','Resistance Band Curl','Kettlebell Curl','Plate Curl','Resistance Band Hammer Curl')

# ---------------- TRICEPS ----------------
add('Triceps','Barbell','Close-Grip Bench Press','EZ-Bar Skull Crusher','Barbell Skull Crusher','JM Press','EZ-Bar Overhead Extension','Board Press')
add('Triceps','Dumbbells','Dumbbell Skull Crusher','Overhead Dumbbell Extension','Single-Arm Overhead Dumbbell Extension','Dumbbell Kickback','Tate Press','Close-Grip Dumbbell Press','Crossbody Dumbbell Extension')
add('Triceps','Machine','Machine Tricep Extension','Machine Dip','Assisted Dip','Smith Machine Close-Grip Press','Smith Machine JM Press')
add('Triceps','Cable','Cable Tricep Pushdown','Rope Pushdown','V-Bar Pushdown','Straight-Bar Pushdown','Reverse-Grip Pushdown','Single-Arm Cable Pushdown','Overhead Rope Extension','Overhead Cable Extension (Bar)','Single-Arm Overhead Cable Extension','Cable Kickback','Cross-Body Cable Extension','Cable Skull Crusher')
add('Triceps','Bodyweight','Bench Dip','Tricep Dip','Weighted Dip','Close-Grip Press-Up','Bodyweight Skull Crusher','Ring Dip')
add('Triceps','Other','Resistance Band Pushdown','Resistance Band Overhead Extension','Kettlebell Overhead Extension')

# ---------------- FOREARMS ----------------
add('Forearms','Barbell','Barbell Wrist Curl','Reverse Barbell Wrist Curl','Behind-the-Back Wrist Curl')
add('Forearms','Dumbbells','Dumbbell Wrist Curl','Reverse Dumbbell Wrist Curl','Farmer\'s Carry','Suitcase Carry','Dumbbell Plate Pinch','Wrist Rotation (Dumbbell)')
add('Forearms','Other','Wrist Roller','Plate Pinch Hold','Grip Crusher','Fat Grip Hold','Towel Hang','Trap Bar Farmer\'s Carry','Kettlebell Bottoms-Up Hold')

# ---------------- QUADS / LEGS ----------------
add('Quads','Barbell','Barbell Back Squat','High-Bar Squat','Low-Bar Squat','Front Squat','Paused Squat','Box Squat','Pin Squat','Zercher Squat','Barbell Hack Squat','Barbell Lunge','Barbell Reverse Lunge','Barbell Walking Lunge','Barbell Split Squat','Barbell Step-Up','Overhead Squat','Anderson Squat','Safety Bar Squat','Tempo Squat','1.5-Rep Squat')
add('Quads','Dumbbells','Goblet Squat','Dumbbell Squat','Dumbbell Front Squat','Bulgarian Split Squat','Walking Lunge','Dumbbell Reverse Lunge','Dumbbell Forward Lunge','Lateral Lunge','Curtsy Lunge','Dumbbell Step-Up','Deficit Reverse Lunge','Heels-Elevated Goblet Squat','Dumbbell Split Squat','Front-Foot-Elevated Split Squat','Cossack Squat')
add('Quads','Machine','Leg Press','Single-Leg Leg Press','Narrow-Stance Leg Press','Hack Squat','Reverse Hack Squat','Pendulum Squat','Belt Squat','V-Squat','Leg Extension','Single-Leg Leg Extension','Smith Machine Squat','Smith Machine Split Squat','Smith Machine Lunge','Smith Machine Hack Squat','Sissy Squat Machine')
add('Quads','Cable','Cable Goblet Squat','Cable Split Squat','Cable Reverse Lunge')
add('Quads','Bodyweight','Bodyweight Squat','Jump Squat','Pistol Squat','Box Pistol Squat','Sissy Squat','Wall Sit','Reverse Nordic','Shrimp Squat','Bodyweight Lunge','Jumping Lunge','Step-Up','Box Jump','Skater Squat','Spanish Squat','Split Squat','Tempo Bodyweight Squat')
add('Quads','Other','Kettlebell Goblet Squat','Kettlebell Front Rack Squat','Landmine Squat','Sled Push','Sled Drag (Backwards)','Resistance Band Squat','Sandbag Squat','Trap Bar Squat','Kettlebell Swing Squat')

# ---------------- HAMSTRINGS ----------------
add('Hamstrings','Barbell','Romanian Deadlift','Stiff-Leg Deadlift','Barbell Good Morning','Seated Good Morning','Sumo Deadlift','Deficit Romanian Deadlift','Snatch-Grip Romanian Deadlift')
add('Hamstrings','Dumbbells','Dumbbell Romanian Deadlift','Single-Leg Romanian Deadlift','Dumbbell Stiff-Leg Deadlift','Dumbbell Leg Curl','Kickstand Romanian Deadlift')
add('Hamstrings','Machine','Lying Leg Curl','Seated Leg Curl','Standing Single-Leg Curl','Glute-Ham Raise','Smith Machine Romanian Deadlift','Nordic Curl Machine')
add('Hamstrings','Cable','Cable Pull-Through','Cable Romanian Deadlift','Standing Cable Leg Curl')
add('Hamstrings','Bodyweight','Nordic Hamstring Curl','Slider Leg Curl','Single-Leg Slider Curl','Swiss Ball Leg Curl','Single-Leg Hip Hinge','Bodyweight Good Morning')
add('Hamstrings','Other','Kettlebell Swing','Single-Arm Kettlebell Swing','American Kettlebell Swing','Kettlebell Romanian Deadlift','Resistance Band Leg Curl','Resistance Band Good Morning','Trap Bar Romanian Deadlift')

# ---------------- GLUTES ----------------
add('Glutes','Barbell','Barbell Hip Thrust','Paused Hip Thrust','Barbell Glute Bridge','Single-Leg Barbell Hip Thrust','B-Stance Hip Thrust','Barbell Frog Pump')
add('Glutes','Dumbbells','Dumbbell Hip Thrust','Single-Leg Dumbbell Hip Thrust','Dumbbell Glute Bridge','Dumbbell Frog Pump','Dumbbell Sumo Squat','Dumbbell Step-Down')
add('Glutes','Machine','Hip Thrust Machine','Glute Kickback Machine','Hip Abduction Machine','Hip Adduction Machine','Smith Machine Hip Thrust','Glute Drive Machine','Reverse Hyper Machine')
add('Glutes','Cable','Cable Glute Kickback','Cable Hip Abduction','Cable Hip Adduction','Cable Glute Bridge','Cable Sumo Squat')
add('Glutes','Bodyweight','Glute Bridge','Single-Leg Glute Bridge','Bodyweight Hip Thrust','Single-Leg Hip Thrust','Donkey Kick','Fire Hydrant','Clamshell','Side-Lying Leg Raise','Frog Pump','Copenhagen Plank','Lateral Band Walk (No Band)')
add('Glutes','Other','Resistance Band Glute Bridge','Resistance Band Lateral Walk','Resistance Band Monster Walk','Resistance Band Kickback','Resistance Band Clamshell','Kettlebell Sumo Deadlift','Landmine Hip Thrust')

# ---------------- CALVES ----------------
add('Calves','Machine','Standing Calf Raise','Seated Calf Raise','Leg Press Calf Raise','Smith Machine Calf Raise','Donkey Calf Raise','Hack Squat Calf Raise','Single-Leg Machine Calf Raise')
add('Calves','Dumbbells','Dumbbell Calf Raise','Single-Leg Dumbbell Calf Raise','Seated Dumbbell Calf Raise','Farmer\'s Walk on Toes')
add('Calves','Barbell','Barbell Calf Raise','Seated Barbell Calf Raise')
add('Calves','Bodyweight','Bodyweight Calf Raise','Single-Leg Calf Raise','Deficit Calf Raise','Tibialis Raise','Pogo Hops','Skipping')
add('Calves','Other','Kettlebell Calf Raise','Tib Bar Raise','Resistance Band Calf Press')

# ---------------- CORE ----------------
add('Core','Bodyweight','Plank','Side Plank','RKC Plank','Plank Shoulder Tap','Plank Up-Down','Long-Lever Plank','Hollow Body Hold','Hollow Rock','Dead Bug','Bird Dog','Crunch','Reverse Crunch','Bicycle Crunch','Sit-Up','V-Up','Tuck-Up','Toe Touch','Leg Raise','Hanging Leg Raise','Hanging Knee Raise','Toes-to-Bar','Captain\'s Chair Knee Raise','L-Sit','Mountain Climber','Cross-Body Mountain Climber','Flutter Kicks','Scissor Kicks','Heel Taps','Russian Twist','Side Plank Hip Dip','Dragon Flag','Bear Crawl','Bear Plank Hold','Windscreen Wipers','Stir the Pot (Swiss Ball)','Swiss Ball Crunch','Swiss Ball Pike','Swiss Ball Rollout','Ab Wheel Rollout','Kneeling Ab Wheel Rollout','Decline Sit-Up','Jackknife','Star Plank','Copenhagen Side Plank','Vacuum')
add('Core','Cable','Cable Crunch','Kneeling Cable Crunch','Cable Woodchopper','High-to-Low Woodchopper','Low-to-High Woodchopper','Pallof Press','Half-Kneeling Pallof Press','Cable Side Bend','Cable Oblique Crunch','Standing Cable Crunch')
add('Core','Machine','Ab Crunch Machine','Rotary Torso Machine','Roman Chair Sit-Up','Roman Chair Side Bend','Decline Bench Crunch')
add('Core','Dumbbells','Weighted Russian Twist','Dumbbell Side Bend','Weighted Decline Sit-Up','Dumbbell Dead Bug','Suitcase Carry (Core)','Dumbbell Leg Raise')
add('Core','Other','Landmine Rotation','Landmine Anti-Rotation','Medicine Ball Slam','Medicine Ball Rotational Throw','Kettlebell Windmill','Turkish Get-Up','Plate Russian Twist','Weighted Plank','Overhead Carry','Waiter\'s Carry','Resistance Band Pallof Press','Sandbag Bear Hug Carry')

# ---------------- FULL BODY / OLYMPIC / CONDITIONING ----------------
add('Full body','Barbell','Power Clean','Hang Clean','Clean and Jerk','Power Snatch','Hang Snatch','Clean Pull','Snatch Pull','Thruster','Barbell Complex','Hang Power Clean','Clean and Press','Muscle Snatch')
add('Full body','Dumbbells','Dumbbell Thruster','Dumbbell Snatch','Dumbbell Clean','Dumbbell Clean and Press','Man Maker','Devil Press','Dumbbell Complex')
add('Full body','Bodyweight','Burpee','Burpee Pull-Up','Bear Crawl (Distance)','Inchworm','Jumping Jack','Squat Thrust','Broad Jump','Tuck Jump','Sprawl','Crab Walk')
add('Full body','Other','Kettlebell Clean','Kettlebell Snatch','Kettlebell Clean and Press','Kettlebell Thruster','Sandbag Clean','Sandbag Over Shoulder','Tyre Flip','Sledgehammer Strike','Battle Rope Waves','Battle Rope Slams','Sled Push (Heavy)','Sled Pull','Prowler Push','Yoke Carry','Atlas Stone Lift','Wall Ball','Medicine Ball Clean','Farmer\'s Carry (Heavy)','Log Press','Axle Deadlift')

# ---------------- CARDIO ----------------
add('Cardio','Machine','Treadmill Walk','Incline Treadmill Walk','Treadmill Run','Treadmill Sprints','Stationary Bike','Spin Bike Intervals','Air Bike','Assault Bike Sprints','Rowing Machine','Rowing Intervals','Cross Trainer','Stair Climber','StairMaster Intervals','SkiErg','Recumbent Bike','Curved Treadmill Sprint','Versaclimber')
add('Cardio','Bodyweight','Outdoor Walk','Outdoor Run','Hill Sprints','Shuttle Runs','High Knees','Butt Kicks','Skipping (Rope)','Double-Unders','Stair Runs','Shadow Boxing','Swimming','Rucking','Cycling (Outdoor)','Bodyweight Circuit')
add('Cardio','Other','Heavy Bag Rounds','Pad Work','Battle Rope Intervals','Sled Sprints','Agility Ladder','Cone Drills')

# ---------------- MOBILITY / WARM-UP ----------------
add('Mobility','Bodyweight','World\'s Greatest Stretch','Hip Flexor Stretch','Couch Stretch','90/90 Hip Switch','Pigeon Stretch','Deep Squat Hold','Cat-Cow','Thoracic Rotation','Thread the Needle','Child\'s Pose','Downward Dog','Cobra Stretch','Hamstring Stretch','Standing Quad Stretch','Calf Stretch','Doorway Chest Stretch','Lat Stretch','Shoulder Dislocates (Broomstick)','Ankle Mobility Drill','Leg Swings','Arm Circles','Hip Circles','Glute Stretch','Figure-4 Stretch','Frog Stretch','Neck Stretch','Wrist Stretch','Jefferson Curl','Scorpion Stretch','Spiderman Lunge with Rotation','Open Book Stretch','Lying Spinal Twist')
add('Mobility','Other','Foam Roll Quads','Foam Roll Hamstrings','Foam Roll Upper Back','Foam Roll Lats','Foam Roll Glutes','Foam Roll Calves','Foam Roll IT Band','Lacrosse Ball Glute Release','Lacrosse Ball Pec Release','Resistance Band Hip Distraction','Resistance Band Shoulder Stretch','Banded Ankle Mobilisation')

def slug(n): return 'x-' + re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')
seen, out = set(), []
for n, m, e in L:
    k = n.lower()
    if k in seen: continue
    seen.add(k); out.append([slug(n), n, m, e])
here = os.path.dirname(os.path.abspath(__file__))
js = ("\n/* =====================================================================\n"
      "   09f: built-in exercise library (generated by src/tools/gen_exlib.py,\n"
      "   do not edit by hand). [id, name, muscle, equipment]\n"
      "   ===================================================================== */\n"
      "const EXLIB = " + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ";\n")
open(os.path.join(here, '..', 'v5', '09f-exlib.js'), 'w').write(js)
from collections import Counter
print(len(out), 'exercises'); print(Counter(m for _, _, m, _ in out))
