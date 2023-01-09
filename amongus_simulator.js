/*
	Among Us Simulator, version 0.5.3
	Made by Sparrow.
	Inspired by Orteil's Murdergames.
*/
/*
	Dev log
	Coming soon:
		More flavor text
		Meetings and ejections
		Randomizing the order of events in part-rounds
		Determining whose body is found
		Task bar at the end of each meeting
	Coming less soon:
		Random impostor mode
		Perks (affecting flavor text as well as likelihood of tasking/killing)
	Maybe coming eventually:
		Suspiciousness levels that can change during meetings
		Votes
		Pronouns
		Rooms
		Importing crew from a file
		Inputting crew from interface
		Emergency meeting button
		Sabotages
		Tasks being assigned to crewmates... or would that make it less random and thus less interesting?
		Map options (would change the idles available, as well as the rooms if those get implemented)
*/


// Characters go here - maybe in the future implement reading from an interface rather than hard coding
let initial_crewmate = 3; // set to number of crewmates
let initial_impostor = 1; // set to number of imps
let total_crew = initial_crewmate + initial_impostor;
let TASKS = 4; // number of tasks
let ITERATOR = 0;
let crew = [];
// No perks yet.
// Crew setup:
{
	
	crew[ITERATOR] = [];
	crew[ITERATOR]["name"] = "Red"; // String
	crew[ITERATOR]["is_imp"] = false; // Boolean
	crew[ITERATOR]["alive"] = true;
	if(!crew[ITERATOR]["is_imp"]) 
		crew[ITERATOR]["tasks_left"] = TASKS;
	ITERATOR++;
	
	crew[ITERATOR] = [];
	crew[ITERATOR]["name"] = "Blue"; // String
	crew[ITERATOR]["is_imp"] = false; // Boolean
	crew[ITERATOR]["alive"] = true;
	if(!crew[ITERATOR]["is_imp"]) 
		crew[ITERATOR]["tasks_left"] = TASKS;
	ITERATOR++;
	
	crew[ITERATOR] = [];
	crew[ITERATOR]["name"] = "Yellow"; // String
	crew[ITERATOR]["is_imp"] = true; // Boolean
	crew[ITERATOR]["alive"] = true;
	if(!crew[ITERATOR]["is_imp"]) 
		crew[ITERATOR]["tasks_left"] = TASKS;
	ITERATOR++;
	
	crew[ITERATOR] = [];
	crew[ITERATOR]["name"] = "Purple"; // String
	crew[ITERATOR]["is_imp"] = false; // Boolean
	crew[ITERATOR]["alive"] = true;
	if(!crew[ITERATOR]["is_imp"]) 
		crew[ITERATOR]["tasks_left"] = TASKS;
	ITERATOR++;

	// Template. Copy and paste this, fill out forms.
	/*
	crew[ITERATOR] = [];
	crew[ITERATOR]["name"] = ""; // String
	crew[ITERATOR]["is_imp"] = ; // Boolean
	crew[ITERATOR]["alive"] = true;
	if(!crew[ITERATOR]["is_imp"]) 
		crew[ITERATOR]["tasks_left"] = TASKS;
	ITERATOR++;
	*/
}

// Actual gameplay loop goes here
// Not implementing rooms just yet heheh
// Just the crewmates doing tasks and the impostors doing kills
// Implement meeting button... later

// Setup:
{
	var alive_crewmate = initial_crewmate;
	var alive_impostor = initial_impostor;
	var game_over = false;
	var meeting = false;
	var dead_this_round = 0;
	var round_num = 1;
	var part_num = 1;
}

// List the crew:
{
	console.log("\nCrew:");
	let role = "";
	for(let i=0; i<ITERATOR; i++)
	{
		if(crew[i]["is_imp"]) role = "Impostor";
		else role = "Crewmate";
		console.log(crew[i]["name"] + " (" + role + ")");
	}
	console.log("Each crewmate has " + TASKS + " tasks.");
}

//Gameplay loop:
while(!game_over)
{
	while(!meeting && !game_over)
	{
		console.log("\n Round " + round_num + " Part " + part_num + "\n");
		switch (round_part())
		{
			case 1:
				meeting = true;
				break;
			case 2: // If kill or task win
			case 3: // then it's game over
				game_over = true;
				break;
			case 0:
			default:
				part_num++;
		}
	}
	
	if(meeting)
	{
		console.log("An Emergency Meeting has been called!");
		console.log("Unfortunately I haven't implemented meetings yet");
		console.log("So nothing happens.");
		round_num++;
		part_num = 1;
		dead_this_round = 0;
		meeting = false;
	}
}

// Game over text:
{
	console.log("Alive Crewmates: " + alive_crewmate);
	console.log("Alive Impostors: " + alive_impostor);
	console.log("\nCrew:");
	let mood = ""; // call this something better
	for(var i=0; i<ITERATOR; i++)
	{
		if(crew[i]["alive"]) mood = "alive";
		else mood = "dead";
		if(crew[i]["is_imp"])
		{
			console.log(crew[i]["name"] + " (Impostor) (" + mood + ")");
		}
		else
		{
			let tasks_done = TASKS - crew[i]["tasks_left"];
			console.log(crew[i]["name"] + " (Crewmate) (" + mood + ") (" + tasks_done + "/" + TASKS + " tasks)");
		}
	}
}

// Round
// Returns 0 for nothing happens, 1 for body found, 2 for imp win, 3 for task win.
function round_part()
{
	for(let i = 0; i < total_crew; i++)
	{
		// each character does 1 action
		// maybe implement random order?
		if(crew[i]["is_imp"])
		{
			if(crew[i]["alive"])
				impostor_action(i);
		}
		else
		{
			if(crew[i]["alive"])
			{
				if (crewmate_action(i) == 1) // if body
				{
					//body_found(i);
					return 1;
				}
			}
			else
				ghost_action(i);
		}
		
		if(alive_impostor >= alive_crewmate)
		{
			console.log("\nImpostors win!");
			return 2;
		}
		if(check_tasks_done())
		{
			console.log("\nAll tasks completed. Crewmates win!");
			return 3;
		}
	}
	return 0;
}



// Crewmate actions go here - in the future have more options
// for the flavor text
// Returns 0 for nothing interesting happens, 1 for body found
function crewmate_action(i)
{
	let pick = Math.floor(Math.random() * 5);
	// Roll a - currently 4 - sided die.
	// Currently: On a 0 or 1 they do a task. 
	// On 4 they find a body, if there is one
	// If not, or on 3, they idle.
	switch(pick)
	{
		case 0:
		case 1:
			if(crew[i]["tasks_left"] > 0)
			{
				crew[i]["tasks_left"]--;
				console.log(crew[i]["name"] + " does a task! (" + crew[i]["tasks_left"] + " left.)");
				break;
			}
		case 4:
			if(dead_this_round > 0)
			{
				console.log(crew[i]["name"] + " has found a body!");
				return 1;
				break;
			}
		default:
			console.log(crew[i]["name"] + " idles around.");
			return 0;
			break;
	}
}

// Impostor actions go here - in the future have more options
// for the flavor text
function impostor_action(i)
{
	let pick = Math.floor(Math.random() * 3); // get a random int between, for now, 0 and 2
	switch(pick)
	{
		case 0:
			console.log(crew[i]["name"] + " fakes a task!");
			break;
		case 1: // case KILL
			let vic = Math.floor(Math.random() * total_crew); // random int btwn 0 and total_crew
			if(crew[vic]["alive"] && !crew[vic]["is_imp"])
			{
				console.log(crew[i]["name"] + " kills " + crew[vic]["name"] + "!");
				crew[vic]["alive"] = false;
				alive_crewmate--;
				dead_this_round++;
				break;
			}
		default:
			console.log(crew[i]["name"] + " idles sussily.");
			break;
	}
}

// Dead crew can still do tasks!
function ghost_action(i)
{
	let pick = Math.floor(Math.random() * 2);// get a random int between, for now, 0 and 1
	switch(pick)
	{
		case 0:
			if(crew[i]["tasks_left"] > 0)
			{
				crew[i]["tasks_left"]--;
				console.log(crew[i]["name"] + " does a task while dead! (" + crew[i]["tasks_left"] + " left.)");
				break;
			}
		default:
			console.log(crew[i]["name"] + " idles ghostily.");
			break;
	}
}

// Currently empty and unused.
function body_found(i)
{
	// Implement the handling of finding bodies?
}

// Check if tasks are done.
function check_tasks_done()
{
	for(let i = 0; i < total_crew; i++)
	{
		if(!crew[i]["is_imp"])
			if(crew[i]["tasks_left"] > 0)
				return false;
	}
	return true;
}

// Perks go here eventually - 
// 2 Crew perks and 1 Imp perk for each character?
// Or if you're pre-selecting the impostors, 2 for each
// Just name the perks here, and state modified chances
// and chance of perk events + any needed variables
// don't list perk events right here
{
	/*
	Perk ideas:
		Slow tasker (crew) (more likely to be sussed/ejected?)
		Fast tasker (crew)
		*Slow killer (imp) (less sus)
		*Fast killer (imp) (more sus)
		*Sussy (any)
		Slick (any) (opposite of sussy)
		*Sus-thrower (any?)
		*Crewpostor (imp - acts crewlike / helps crew?)
		*Immate (crew - acts impy / helps the imps?)
		*Third imp (crew - helps the imps)
		*Sab-spammer (imp)
		*Doesn't fix sabs (crew)
		*Body ignorer (crew?)
		Selfer (imp - high chance of reporting bodies they make, same turn or other)
		*Lurker (imp - hides out in the same room and usually kills there)
		*Cam-camper (any)
		Strategist (any? - basically bigbraining)
		*Detective (crew - actively tries to track down imp)
		*DeFective (crew - tries to detective but bad at it)
		Head Empty (any - lots of idles around instead of other idle text?)
		Superstitious (any - picks a random other crewmember at start, and refuses to kill, vote, or sus that one)
		*Paranoid (any)
		*Biased (any - picks a random other crewmember and tries to get that one dead)
		*Marinator (imp - able to hang out with a crewmate and convince that crewmate they're good)
		*Gullible (crew - easily marinated)
		Lucky - less likely to be killed early
		Unlucky - more likely to be killed early
		*Follower - finds someone and follows them around
		*Eldritch (imp)
		
		*Scientist (crew - higher chance of finding bodies if there are any?)
		Engineer (crew - can travel btwn rooms if those are implemented? higher chance of being sussed tho)
		*Shapeshifter (imp)
		
		
	* = would have its own flavor text for some things
	
	Perks taken from murdergames:
		Leader (more likely to be agreed with)
		Annoying (more likely to be ejected)
		Cute (more likable)
		Devious (willing to betray others)?
	*/
}



// Events go here.
{
	const base_crew_idles = [
		"idles around."
	];
	const tasks_remaining_idles = [
		"starts a task, but loses interest.",
		"struggles with their task, eventually giving up.",
		"thinks about doing a task, but doesn't feel like it."
	];
	const base_imp_idles = [
		"idles sussily."
	];
	const base_ghost_idles = [
		"idles ghostily."
	];
	const interact_ghost_idles = [
		"follows %s around curiously.",
		"follows %s around suspiciously."
	]; // Note that this %s etc works with console.log.
	
	const task_lines = [
		"cleans an entire pizza out of the vent...",
		"manages to calibrate the distributor properly on their first try.",
		"shoots at asteroids for a few minutes.",
		"gets themself scanned... but no one saw."
	];
	const interact_task_lines = [
		"gets themself scanned, while watched by %s."
	];
	const interrupted_task_lines = [
		"was almost done with their download!"
	];
	const kill_interrupted_task_lines = [
		"kills %s in the middle of their scan.",
		"strangles %s with the wires they were fixing."
	];
	const kill_lines = [
		"knocks %s to the floor, and shoots them while they're down.",
		"sneaks up behind %s and snaps their neck.",
		"stabs %s 17 times in the back with a hunting knife.",
		"impales %s with a prehensile tentacle.",
		"lulls %s into a false sense of security, before violently murdering them.",
		"lulls %s into a false sense of security, before politely murdering them.",
		"walks right up to %s and stabs them multiple times before casually walking away.",
		"chops %s to pieces with a meat cleaver.",
		"pops out of a vent and shoots %s.",
		"corners %s in a secluded location, then shoots them and leaves them to die.",
		"kills %s and shoves their body into a vent.",
		"murders %s and arranges their body to look like they're just focusing really hard on a task.",
		"murders %s and arranges their body to look like they're sleeping.",
		"violently eviscerates %s, getting blood all over the place."
	];
	
	const meeting_accusation_lines = [];
	const meeting_defense_lines = [];
}