/*
	Among Us Simulator, version 1.2.1
	Made by Sparrow.
	Inspired by Orteil's Murdergames.
*/
/*
	Dev log
	Changes:
		Added flavor text: 3 tasks, 3 crew idles, 14 kills.
		Ghost crewmates can have the new task flavortext too.
		Ghost crewmates cannot use the failing at a task idle lines. This is a bug.
	Coming soon:
		MORE flavor text
		Perks (affecting flavor text as well as likelihood of tasking/killing)
		Meetings and ejections
		Dead impostors in general?
		Randomizing the order of events in part-rounds?
		Determining whose body is found
		Task bar at the end of each meeting
	Coming less soon:
		Random impostor mode
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

// Setup of a game. Global variables, for now.
// These need to be made dynamic and actually count the values.
let initial_crewmate = 3; // set to number of crewmates
let initial_impostor = 1; // set to number of imps
let total_crew = initial_crewmate + initial_impostor; //Deprecated
let TASKS = 4; // number of tasks
let crew = [];

// Constructor for character objects
function Character(name, is_imp, alive, tasks_left, perk1, perk2, role, imp_lines, crew_lines)
{
	this.name = name;
	this.is_imp = is_imp;
	this.alive = alive;
	this.tasks_left = tasks_left;
	this.perk1 = perk1;
	this.perk2 = perk2;
	// Note to self: Store perk values as numbers but reference them by name? Or by variable names referencing numbers? I just don't want to have to type quotes around it every time.
	// role, imp_lines, and crew_lines, all don't need to be initialized - they'll be assigned later
}

// Initializing DEFAULT characters.
// Impostors are given tasks but the tasks are never tallied.
// parameters are: name, imp status, alive status, number of tasks, perk 1, perk 2
function init_default_characters()
{
	crew[crew.length] = new Character("Red", false, true, TASKS, 0,0);
	crew[crew.length] = new Character("Blue", false, true, TASKS, 0,0);
	crew[crew.length] = new Character("Yellow", true, true, TASKS, 0,0);
	crew[crew.length] = new Character("Purple", false, true, TASKS, 0,0);
	// crew[crew.length] = new Character("name", imp status, alive status, TASKS, 0,0);
}

function setup_characters()
{
	for(let i=0; i<crew.length; i++) // Setting default roles, and assigning lines.
	{
		if(crew[i].is_imp && !crew[i].role) // if imp and no role
			crew[i].role = "Impostor";
		else if(!crew[i].is_imp && !crew[i].role) // if crewmate and no role
			crew[i].role = "Crewmate";
		if(!crew[i].perk1 && crew[i].perk2)
		{ // if perk 2 assigned but not 1
			crew[i].perk1 = crew[i].perk2;
			crew[i].perk2 = 0;
		}
		assign_lines(i);
	}
}

// The sets of lines to assign from:
const base = 
{
	imp:
	{
		idles: [
			" idles sussily."
		],
		ghost_idles: [
			" idles ghostily."
			],
		interact_ghost_idles: [
			" follows %s around curiously.",
			" follows %s around evilly."
			],
		task_fake_lines: [], // TODO
		kill_interrupted_task_lines: [
			" kills %s in the middle of their scan.",
			" strangles %s with the wires they were fixing."
			],
		kill_lines: [
			" knocks %s to the floor, and shoots them while they're down.",
			" sneaks up behind %s and snaps their neck.",
			" stabs %s 17 times in the back with a hunting knife.",
			" impales %s with a prehensile tentacle.",
			" lulls %s into a false sense of security, before violently murdering them.",
			" lulls %s into a false sense of security, before politely murdering them.",
			" walks right up to %s and stabs them multiple times before casually walking away.",
			" chops %s to pieces with a meat cleaver.",
			" pops out of a vent and shoots %s.",
			" corners %s in a secluded location, then shoots them and leaves them to die.",
			" kills %s and shoves their body into a vent.",
			" murders %s and arranges their body to look like they're just focusing really hard on a task.",
			" murders %s and arranges their body to look like they're sleeping.",
			" violently eviscerates %s, getting blood all over the place."
			],
		meeting_accusation_lines: [],
		meeting_defense_lines: []
	},

	crew: 
	{
		idles: [
			" idles around."
			],
		ghost_idles: [
			" idles ghostily."
			],
		interact_ghost_idles: [
			" follows %s around curiously.",
			" follows %s around suspiciously."
			], // Note that this %s etc works with console.log.
		tasks_remaining_idles: [
			" starts a task, but loses interest.",
			" struggles with a task, eventually giving up.",
			" thinks about doing a task, but doesn't feel like it."
			],
		task_lines: [
			" cleans an entire pizza out of the vent...",
			" manages to calibrate the distributor properly on their first try.",
			" shoots at asteroids for a few minutes.",
			" gets themself scanned... but no one saw."
			],
		interact_task_lines: [
			" gets themself scanned, while watched by %s."
			],
		interrupted_task_lines: [
			" was almost done with their download!"
			],
		meeting_accusation_lines: [],
		meeting_defense_lines: []
	}
}	

// Perks go here eventually - 
/*
// 2 Crew perks and 1 Imp perk for each character?
// Or if you're pre-selecting the impostors, 2 for each character
// Just name the perks here, and state modified chances
// and chance of perk events + any needed variables
// don't list perk events right here
// Note to self: Are any perks mutually exclusive?
//Perk ideas:
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

// Setting up the flavor text lines for a character.
// Please note that this assigns a lot of duplicates. That's there for a reason I promise.
// There's got to be a better way of doing this.
// But right now this is all I can think of to create the pools of lines to pull from.
function assign_lines(i)
{
	let PERK1 = crew[i].perk1 ? crew[i].perk1 : base;
	let PERK2 = crew[i].perk2 ? crew[i].perk2 : base;
	crew[i].imp_lines = 
	{ // : base.imp..concat(PERK1.imp., PERK2.imp.),
		idles: base.imp.idles.concat(PERK1.imp.idles, PERK2.imp.idles),
		ghost_idles: base.imp.ghost_idles.concat(PERK1.imp.ghost_idles, PERK2.imp.ghost_idles),
		interact_ghost_idles: base.imp.interact_ghost_idles.concat(PERK1.imp.interact_ghost_idles, PERK2.imp.interact_ghost_idles),
		kill_lines: base.imp.kill_lines.concat(PERK1.imp.kill_lines, PERK2.imp.kill_lines),
		kill_interrupted_task_lines: base.imp.kill_lines.concat(base.imp.kill_interrupted_task_lines,PERK1.imp.kill_interrupted_task_lines, PERK2.imp.kill_interrupted_task_lines),
		meeting_accusation_lines: base.imp.meeting_accusation_lines.concat(PERK1.imp.meeting_accusation_lines, PERK2.imp.meeting_accusation_lines),
		meeting_defense_lines: base.imp.meeting_defense_lines.concat(PERK1.imp.meeting_defense_lines, PERK2.imp.meeting_defense_lines),
		
	}
	crew[i].crew_lines = 
	{ // : base.crew..concat(PERK1.crew., PERK2.crew.),
		idles: base.crew.idles.concat(PERK1.crew.idles, PERK2.crew.idles),
		ghost_idles: base.crew.ghost_idles.concat(PERK1.crew.ghost_idles, PERK2.crew.ghost_idles),
		interact_ghost_idles: base.crew.interact_ghost_idles.concat(PERK1.crew.interact_ghost_idles, PERK2.crew.interact_ghost_idles),
		//tasks_remaining_idles: crew[i].crew_lines.idles.concat(base.crew.tasks_remaining_idles, PERK1.crew.tasks_remaining_idles, PERK2.crew.tasks_remaining_idles),
		//tasks_remaining_ghost_idles: crew[i].crew_lines.ghost_idles.concat(base.crew.tasks_remaining_ghost_idles, PERK1.crew.tasks_remaining_ghost_idles, PERK2.crew.tasks_remaining_ghost_idles),
		task_lines: base.crew.task_lines.concat(PERK1.crew.task_lines, PERK2.crew.task_lines),
		interact_task_lines: base.crew.interact_task_lines.concat(PERK1.crew.interact_task_lines, PERK2.crew.interact_task_lines),
		interrupted_task_lines: base.crew.interrupted_task_lines.concat(PERK1.crew.interrupted_task_lines, PERK2.crew.interrupted_task_lines),		
		
	}
	crew[i].crew_lines.tasks_remaining_idles = crew[i].crew_lines.idles.concat(base.crew.tasks_remaining_idles, PERK1.crew.tasks_remaining_idles, PERK2.crew.tasks_remaining_idles);
	crew[i].crew_lines.tasks_remaining_ghost_idles = crew[i].crew_lines.ghost_idles.concat(base.crew.tasks_remaining_ghost_idles, PERK1.crew.tasks_remaining_ghost_idles, PERK2.crew.tasks_remaining_ghost_idles);
}

// Round (Part)
// Returns 0 for nothing happens, 1 for body found, 2 for imp win, 3 for task win.
function round_part()
{
	for(let i = 0; i < crew.length; i++)
	{
		// each character does 1 action
		// maybe implement random order?
		if(crew[i].is_imp)
		{
			if(crew[i].alive) impostor_action(i);
		}
		else
		{
			if(crew[i].alive)
			{
				// Runs a crewmate action and checks the result.
				if (crewmate_action(i) == 1) // if body
				{
					//body_found(i);
					return 1;
				}
			}
			else ghost_crewmate_action(i);
		}
		
		if(alive_impostor >= alive_crewmate)
		{
			console.log("\nImpostors win!");
			return 2;
		}
		if(check_tasks_done()) // Counts the tasks.
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
		case 1: // case they do a task
			if(crew[i]["tasks_left"] > 0)
			{
				crew[i]["tasks_left"]--;
				let line = Math.floor(Math.random() * crew[i].crew_lines.task_lines.length);
				//console.log(crew[i].name + " does a task! (" + crew[i].tasks_left + " left.)");
				console.log(crew[i].name + crew[i].crew_lines.task_lines[line] + " (" + crew[i].tasks_left + " tasks left.)");
				return 0;
				break;
			}
		case 4:
			if(dead_this_round > 0)
			{
				console.log(crew[i].name + " has found a body!");
				return 1;
			} // no break - if there's no body, they idle
		default: // case idle
			if(crew[i].tasks_left)
			{
				let line = Math.floor(Math.random() * crew[i].crew_lines.tasks_remaining_idles.length);
				console.log(crew[i].name + crew[i].crew_lines.tasks_remaining_idles[line]);
			}
			else 
			{
				let line = Math.floor(Math.random() * crew[i].crew_lines.idles.length);
				console.log(crew[i].name + crew[i].crew_lines.idles[line]);
			}
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
			console.log(crew[i].name + " fakes a task!");
			break;
		case 1: // case KILL
			let vic = Math.floor(Math.random() * crew.length); // random int btwn 0 and crew.length
			if(crew[vic].alive && !crew[vic].is_imp)
			{
				let line = Math.floor(Math.random() * crew[i].imp_lines.kill_lines.length);
				console.log(crew[i].name + crew[i].imp_lines.kill_lines[line], crew[vic].name);
				//console.log(crew[i].name + " kills " + crew[vic].name + "!");
				crew[vic].alive = false;
				alive_crewmate--;
				dead_this_round++;
				break;
			}
		default:
			console.log(crew[i].name + " idles sussily.");
			break;
	}
}

// Dead crew can still do tasks!
function ghost_crewmate_action(i)
{
	let pick = Math.floor(Math.random() * 2);// get a random int between, for now, 0 and 1
	switch(pick)
	{
		case 0:
			if(crew[i].tasks_left)
			{
				crew[i].tasks_left--;
				let line = Math.floor(Math.random() * crew[i].crew_lines.task_lines.length);
				//console.log(crew[i].name + " does a task while dead! (" + crew[i].tasks_left + " left.)");
				console.log("The deceased " + crew[i].name + crew[i].crew_lines.task_lines[line] + " (" + crew[i].tasks_left + " tasks left.)");
				break;
			}
		default: // Tasks remaining ghost idles is broken
			/*if(crew[i].tasks_left)
			{
				let line = Math.floor(Math.random() * crew[i].crew_lines.tasks_remaining_ghost_idles.length);
				console.log(crew[i].name + crew[i].crew_lines.tasks_remaining_ghost_idles[line]);
			}
			else*/
			{
				let line = Math.floor(Math.random() * crew[i].crew_lines.ghost_idles.length);
				console.log(crew[i].name + crew[i].crew_lines.ghost_idles[line]);
			}
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
		if(!crew[i].is_imp)
			if(crew[i].tasks_left > 0)
				return false;
	}
	return true;
}


// The main code. It's not named main because things go out of scope when I do that.
{
	init_default_characters();
	setup_characters();

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
		for(let i=0; i<crew.length; i++)
		{
			console.log(crew[i].name + " (" + crew[i].role + ")");
			//console.log(crew[i].imp_lines); // Debug
			//console.log(crew[i].crew_lines); // Debug
		}
		console.log("Each crewmate has " + TASKS + " tasks.");
	}

	//Gameplay loop:
	while(!game_over)
	{
		while(!meeting && !game_over)
		{
			console.log("\n Round " + round_num + " Part " + part_num + "\n");
			switch (round_part()) // Calls the function that runs a part of a round, and then tests the result.
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
			console.log("Unfortunately I haven't implemented meetings yet.");
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
		for(var i=0; i<crew.length; i++)
		{
			if(crew[i].is_imp)
			{
				console.log(crew[i].name + " (Impostor) (" + (crew[i].alive ? "alive" : "dead") + ")");
			}
			else
			{
				console.log(crew[i].name + " (Crewmate) (" + (crew[i].alive ? "alive" : "dead") + ") (" + (TASKS - crew[i].tasks_left) + "/" + TASKS + " tasks)");
			}
		}
	}

}