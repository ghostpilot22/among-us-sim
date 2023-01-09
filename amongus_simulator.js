/*
	Among Us Simulator, version 0.5.1
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
	Coming less soon:
		Random impostor mode
		Perks (affecting flavor text as well as likelihood of tasking/killing)
	Maybe coming eventually:
		Suspiciousness levels that can change during meetings
		Votes
		Rooms
		Importing crew from a file
		Inputting crew from interface
		Emergency meeting button
*/


// Characters go here - maybe in the future implement reading from an interface rather than hard coding
initial_crewmate = 3; // set to number of crewmates
initial_impostor = 1; // set to number of imps
total_crew = initial_crewmate + initial_impostor;
TASKS = 4; // number of tasks
ITERATOR = 0;
crew = [];
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
alive_crewmate = initial_crewmate;
alive_impostor = initial_impostor;
game_over = false;
meeting = false;
dead_this_round = 0;
round_num = 1;
part_num = 1;
}

// List the crew:
{
	console.log("\nCrew:");
	role = "";
	for(var i=0; i<ITERATOR; i++)
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
	mood = ""; // call this something better
	for(i=0; i<ITERATOR; i++)
	{
		if(crew[i]["alive"]) mood = "alive";
		else mood = "dead";
		if(crew[i]["is_imp"])
		{
			console.log(crew[i]["name"] + " (Impostor) (" + mood + ")");
		}
		else
		{
			tasks_done = TASKS - crew[i]["tasks_left"];
			console.log(crew[i]["name"] + " (Crewmate) (" + mood + ") (" + tasks_done + "/" + TASKS + " tasks)");
		}
	}
}

// Round
function round_part() // Returns 0 for nothing happens, 1 for body found, 2 for imp win, 3 for task win.
{
	for(var i = 0; i < total_crew; i++)
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
	pick = Math.floor(Math.random() * 5);
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
	pick = Math.floor(Math.random() * 3); // get a random int between, for now, 0 and 2
	switch(pick)
	{
		case 0:
			console.log(crew[i]["name"] + " fakes a task!");
			break;
		case 1: // case KILL
			vic = Math.floor(Math.random() * total_crew); // random int btwn 0 and total_crew
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
	pick = Math.floor(Math.random() * 2);// get a random int between, for now, 0 and 1
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
	for(var i = 0; i < total_crew; i++)
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
// don't list perk events here



// Events go here.
{
	base_crew_idles = [];
	base_imp_idles = [];
	base_ghost_idles = [];
}