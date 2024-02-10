
/*
amongus_simulator_java.java

Game
	Properties:
	- Number of crew
	- Number of imps
	- Characters
	- Status
	Functionality:
	- Start a game
	- Run a (partial) round
	- Run a meeting
	- End game
*/
/*
Game status
	Properties:
	- What number round is it
	- How many partial rounds it's been in the current round
	- Whether it's in round, in meeting, starting the game, or game over
	- Number of imps still alive
	- Number of crew still alive
	- How many bodies are lying around
	- Any sabotages?
	Functionality:
	- Getters and setters for all of the above
	- Determine whether or not game is over / who won if so
*/
/*
Crewmate
	Properties:
	- Name
	- Color
	- Imp/crew status
	- Perk 1
	- Perk 2
	- Alive/dead status
	- Likelihood of doing various things (impness could simply adjust likelihoods, maybe)
	- Room in?
	- Tasks remaining
	- Tasks done
	- Lines of various sorts
	Functionality:
	- Do an action:
	-- Idle
	-- Do task
	-- Fake task
	-- Kill
	-- Die?
	-- Find body
	- Defend self (during meeting)
	- Accuse others (during meeting)
	- Vote (during meeting)
*/
/*
Impostor extends Crewmate?
Ghost extends both?
Perks also extend? Or are sub-objects?

Perk
	Properties:
	- Name
	- Lines
	- Likelihoods
	Functionality:
	- Get lines
	- Get likelihoods
Note: Have to deal with potential conflicting likelihoods between perks?
*/

// TODO: 
// - Implement impostors killing.
// - Add more idle lines.
// - Add game over flavor text.

package sim.amongus;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Random;

public class GameMain
{
	public static void main(String[] args)
	{
		// Create the crewmates and give them perks. Maybe in the future let the user input this part but for now just have it be a default.
		ArrayList<Crewmate> crew = new ArrayList<Crewmate>();
		crew.add(new Crewmate("Red"));
		crew.add(new Crewmate("Blue"));
		crew.get(1).addTag("tentacles");
	
		//crew.add(new Crewmate("Green"));
		crew.add(new Crewmate("Yellow"));
		//crew.add(new Crewmate("Pink"));
		
		Game game = new Game (crew, 1);
		game.runGame();
		
		return;
	}
}

public class Game 
{
	private Random rand = new Random();
	public ArrayList<Crewmate> crewmates; // group of character objects
	private int total_crew;
	private int num_imps;
	private GameStatus status;
	
	public Game(ArrayList<Crewmate> crew, int imps)
	{
		this.crewmates = crew;
		this.total_crew = crew.size();
		this.num_imps = imps;
		this.status = new GameStatus(total_crew, num_imps);
	}
	
	public GameStatus getStatus() {return this.status;}
	
	// This actually runs the game.
	// Currently the game is limited to 5 3-part rounds, since there's currently no actual way for the game to end lmao.
	public void runGame()
	{
		for(int i = 0; i < num_imps; i++)
		{
			int r = rand.nextInt(total_crew);
			if(crewmates.get(r).getIsImp() == false) crewmates.get(r).assignImp();
		}
		// While game not over, run rounds.
		while(this.status.getWinState() == 0) 
		{
			// Run a round. If game not over, run a meeting. Rinse and repeat until game over.
			// Yes, with the current limit on round parts per round, this means that a meeting will automatically happen every 3 round parts whether or not anyone called it. I'll change this eventually once I add some proper functionality - for now it's just to prevent infinite looping.
			this.round();
			if(this.status.getWinState() == 0)
				this.meeting();
			
			// This is also to prevent infinite looping.
			if(this.status.getRoundNum() > 4)
			{
				this.endGame(4);
				return;
			}
		}
		// Once the game is over, run the end game.
		this.endGame(this.status.getWinState());
		return;
	}
	
	// Runs a part of a round. Returns 0 for nothing of note happened, 1 for meeting triggered, 2 for game over triggered.
	private int roundPart()
	{
		this.status.incRoundPartNum();
		System.out.println("\nRound " + this.status.getRoundNum() + ", Part " + this.status.getRoundPartNum());
		
		// Each crewmate does an action, and then the game checks to see if there's a win state, a meeting trigger, or not.
		for(int i = 0; i < this.total_crew; i++)
		{
			crewmates.get(i).action(); // TODO set up the crewmates and their actions.
			if(this.status.checkWinState(crewmates) != 0) return 2;
			// If meeting triggered return 1
		}
		// If everyone's done osmething and nothing of note happened, return 0
		return 0;
	}
	
	// Runs a full round - by running round parts until something happens. Doesn't return anything because all the needed information is contained in status.win_state.
	private void round()
	{
		// Increase the round number by 1, and set the round part number to 0.
		this.status.incRoundNum();
		this.status.resetRoundPartNum();
		
		// Run part of a round. Each time check to see if the round state changed, if not run another part.
		// Limited to 5 round parts per round, for my sanity or something idk.
		int round_state = 0;
		while(round_state == 0)
		{
			round_state = this.roundPart();
			if(this.status.getRoundPartNum() > 2) return;
		}
		
		// Once it gets out of the loop, return nothing lol so the round can end.
		return;
	}
	
	private int meeting()
	{
		// TODO implement meeting
		return 0;
	}
	
	// End game screen. -1 = imp win, 1 = crew win by voting imps off, 2 = crew win by tasks, 4 = the game went for so long that it auto-ended.
	private void endGame(int state)
	{
		// TODO implement game over
		System.out.println("Game over (" + state + ")");
	}
}

public class GameStatus
{
	private int num_crews; // Number of Crewmates (not to be confused with the total number of crew including impostors. This number does not count impostors.)
	private int num_imps; // Number of Impostors.
	private int round_number;
	private int roundpart_number;
	String state; // Can be 'in round' 'meeting called' 'game starting' 'game over' maybe?
	private int win_state; // 0 for no win yet, 1 for crew win, 2 for crew win by tasks, -1 for imp win.
	private int imps_alive;
	private int crews_alive;
	private int bodies; // How many bodies are lying around, able to be found.
	private int crews_completed_tasks; // How many of the crewmates have completed all their tasks.
	// private String sab_state; // Sabotages not implemented yet.
	
	// Constructor. Creates a GameStatus object. total_crew and num_imps must be provided. Round number and part number set to 0, will increment upon the round method running. Crew alive and imps alive set to numbers of crew and imps. Bodies and number of crewmates with tasks completed set to 0. Win state set to 0 (no win).
	public GameStatus(int total_crew, int num_imps) 
	{
		this.num_crews = total_crew - num_imps;
		this.num_imps = num_imps;
		
		this.round_number = 0;
		this.roundpart_number = 0;
		this.state = "game starting";
		this.win_state = 0;
		//this.sab_state = "";
		
		this.crews_alive = this.num_crews;
		this.imps_alive = num_imps;
		this.bodies = 0;
		this.crews_completed_tasks = 0;
	}
	
	public int getRoundNum() {return this.round_number;}
	public int getRoundPartNum() {return this.roundpart_number;}
	public String getState() {return this.state;}
	public int getImpsLeft() {return this.imps_alive;}
	public int getCrewLeft() {return this.crews_alive;}
	public int getBodyNum() {return this.bodies;}
	public int getTaskCompNum() {return this.crews_completed_tasks;}
	//public String getSabState() {return this.sab_state;}
	
	public void resetRoundNum() {this.round_number = 0;}
	public void incRoundNum() {this.round_number++;}
	public void resetRoundPartNum() {this.roundpart_number = 0;}
	public void incRoundPartNum() {this.roundpart_number++;}
	public void setState(String s) {this.state = s;}
	public void setImpsLeft(int i) {this.imps_alive = i;}
	public void setCrewLeft(int c) {this.crews_alive = c;}
	public void setBodyNum(int b) {this.bodies = b;}
	//public void setSabState(String s) {this.sab_state = s;}
	
	// Determines, sets, and returns the win state. 1 if the crew have won by ejecting impostors, -1 if the impostors have won, 2 if the crew have won by tasks, and 0 if there isn't a win condition met.
	// Could add something for imp sab win, once sabotages are implemented.
	// This one runs after a character does an action.
	public int checkWinState(ArrayList<Crewmate> crewmates)
	{
		if(this.imps_alive == 0) 
		{
			this.state = "game over";
			this.win_state = 1;
		}
		else if(this.imps_alive >= this.crews_alive)
		{
			this.state = "game over";
			this.win_state = -1;
		}
		else
		{
			this.win_state = 2;
			for (int i = 0; i < this.num_crews; i++)
			{
				if(crewmates.get(i).getTasksLeft() > 0) 
				{ this.win_state = 0; return 0;}
			}
			this.state = "game over";
		}
		
		return this.win_state;
	}
	// Returns the win state without checking to update it.
	// This one can be run whenever there's not the possibility of the win state having changed since last time it was checked.
	public int getWinState() { return this.win_state; }
	
}

public class Crewmate
{
	private static Random rand = new Random();
	private String name;
	private String color;
	private boolean is_imp;
	public boolean getIsImp() {return is_imp;}
	public void addTag(String tag) { tags.add(tag); }
	private boolean is_alive;
	private ArrayList<String> tags;
	private HashMap<String, Double> chances;
	// Implement rooms later maybe?
	private int total_tasks;
	private int tasks_left;
	public int getTasksLeft() { return tasks_left; }
	private static Lines lines;
	
	// Default constructor. Set the default chances and stuff in here. This shouldn't be used though? TODO make better lol
	public Crewmate() 
	{
		this.name = ""; 
		this.chances = new HashMap<String, Double>(); 
		setDefaultChances();
		this.tags = new ArrayList<String>();
		this.tags.add("base");
		this.total_tasks = 4;
		this.tasks_left = 4; 
	}
	
	public Crewmate(String name) 
	{
		this.name = name; 
		this.chances = new HashMap<String, Double>(); 
		setDefaultChances();
		this.tags = new ArrayList<String>();
		this.tags.add("base");
		this.tags.add("tasksleft");
		this.total_tasks = 4;
		this.tasks_left = 4; 
	}
	
	public String getName() { return this.name; }
	// TODO add a non-default constructor.
	
	private void setDefaultChances()
	{
		// These process in order from top to bottom.
		// It'll check if the rolled value is BELOW the number, and if so the character will do that thing, and if not it'll check the next option.
		this.chances.put("task", 0.75);
		this.chances.put("kill", 0.0);
		this.chances.put("find body", 0.85);
	}
	
	// This method turns a crewmate into an impostor. It'll adjust the chances of doing tasks and killing and stuff.
	// Currently just switches the task and kill chances.
	public void assignImp()
	{
		System.out.println(name + " is an impostor!");
		chances.put("kill", chances.get("task"));
		chances.put("task", 0.0);
		total_tasks = 0;
		tasks_left = 0;
		this.tags.remove("tasksleft");
		this.tags.add("impostor");
	}
	
	public void action()
	{
		double i = rand.nextDouble();
		if (i < this.chances.get("task"))
		{
			this.tasks_left -= 1;
			System.out.println(this.name + Lines.getTask(this.tags) + " (" + this.tasks_left + " tasks remaining)"); 
			if(this.tasks_left <= 0) 
			{
				this.chances.remove("task");
				this.chances.put("task", 0.0);
				this.tags.remove("tasksleft");
			}
		}
		//if (i < this.chances.get("kill"))
		//	System.out.println(this.name + Lines.getKill(this.tags)); 
		else 
			System.out.println(this.name + Lines.getIdle(this.tags)); 
	}
}

public class Lines
{
	private static Random rand = new Random();	
	// Set of items that each have a tag of what type it is. 
	// So each item is an array, and the second item is the tag. And the method gets called with an array of strings that's the tags. It'll randomly generate a number and then find that number item in the list, then check if the array of allowed tags contains that tag. And if so it'll return the item.
	
	private static ArrayList<String[]> idles;
	static
	{
		idles = new ArrayList<String[]>();
		idles.add( new String[] { " idles around.", "base" });
		idles.add( new String[] { " idles ghostily.", "ghost" });
		idles.add( new String[] { " idles sussily.", "impostor" });
		idles.add( new String[] { " idles sussily.", "crewpostor" });
		idles.add( new String[] { " starts a task, but loses interest.", "tasksleft" });
		idles.add( new String[] { " struggles with a task, eventually giving up.", "tasksleft" });
		idles.add( new String[] { " thinks about doing a task, but doesn't feel like it.", "tasksleft" });
		
	}
	private static ArrayList<String[]> tasks;
	static
	{
		tasks = new ArrayList<String[]>();
		tasks.add( new String[] { " cleans an entire pizza out of the vent...", "base" });
		tasks.add( new String[] { " manages to calibrate the distributor properly on their first try.", "base" });
		tasks.add( new String[] { " shoots at asteroids for a few minutes.", "base" });
		tasks.add( new String[] { " gets themself scanned... but no one saw.", "base" });
		
	}
	
	public static String getIdle(ArrayList<String> tags)
	{
		int i = 0;
		for(int j=0; j<20; j++) // To prevent infinite loops.
		{
			i = rand.nextInt(idles.size());
			if(tags.contains(idles.get(i)[1])) 
				return idles.get(i)[0];
		}
		return "";
	}
	
	public static String getTask(ArrayList<String> tags)
	{
		int i = 0;
		boolean found = false;
		for(int j=0; j<20; j++) // To prevent infinite loops.
		{
			i = rand.nextInt(tasks.size());
			if(tags.contains(tasks.get(i)[1])) 
				return tasks.get(i)[0];
		}
		return "";
	}
	
	private static ArrayList<String[]> kills;
	static
	{
		kills = new ArrayList<String[]>();
		kills.add( new String[] { " kills %s in the middle of their scan.", "base" });
		kills.add( new String[] { " strangles %s with the wires they were fixing.", "base" });
		kills.add( new String[] { " knocks %s to the floor, and shoots them while they're down.", "base" });
		kills.add( new String[] { " sneaks up behind %s and snaps their neck.", "base" });
		kills.add( new String[] { " stabs %s 17 times in the back with a hunting knife.", "base" });
		kills.add( new String[] { " impales %s with a prehensile tentacle.", "tentacles" });
		kills.add( new String[] { " lulls %s into a false sense of security, before violently murdering them.", "base" });
		kills.add( new String[] { " lulls %s into a false sense of security, before politely murdering them.", "base" });
		kills.add( new String[] { " walks right up to %s and stabs them multiple times before casually walking away.", "base" });
		kills.add( new String[] { " chops %s to pieces with a meat cleaver.", "base" });
		kills.add( new String[] { " pops out of a vent and shoots %s.", "base" });
		kills.add( new String[] { " corners %s in a secluded location, then shoots them and leaves them to die.", "base" });
		kills.add( new String[] { " kills %s and shoves their body into a vent.", "base" });
		kills.add( new String[] { " murders %s and arranges their body to look like they're just focusing really hard on a task.", "base" });
		kills.add( new String[] { " murders %s and arranges their body to look like they're sleeping.", "base" });
		kills.add( new String[] { " violently eviscerates %s, getting blood all over the place.", "base" });
	}
	
	public static String getKill(ArrayList<String> tags)
	{
		int i = 0;
		boolean found = false;
		for(int j=0; j<20; j++) // To prevent infinite loops.
		{
			i = rand.nextInt(kills.size());
			if(tags.contains(kills.get(i)[1])) 
				return kills.get(i)[0];
		}
		return "";
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
	
	
		/*
		interact_ghost_idles: [
			" follows %s around curiously.",
			" follows %s around suspiciously."
			], // Note that this %s etc works with console.log.
		tasks_remaining_idles: [
			" starts a task, but loses interest.",
			" struggles with a task, eventually giving up.",
			" thinks about doing a task, but doesn't feel like it."
			],
		interact_task_lines: [
			" gets themself scanned, while watched by %s."
			],
		interrupted_task_lines: [
			" was almost done with their download!"
			],
			interact_ghost_idles: [
			" follows %s around curiously.",
			" follows %s around evilly."
			],
		task_fake_lines: [], // TODO
		*/
	
}


// Perk class. The name and type of perk correspond to one set of flavor texts. The sets are going to be STATIC arraylists, I think. Actually I think maybe the perks are just numbers kind of thing, and all the flavor texts will be STATIC lists in the crewmate class.
// Or maybe perked characters should be a subclass of crewmate? The only thing added would be more flavor texts.
public class Perk
{
	private String name;
	private int type;
	
	
}

