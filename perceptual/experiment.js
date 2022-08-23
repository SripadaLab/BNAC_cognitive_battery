/*
Anti-saccade task
*/

/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var current_trial = 0
var letters = '27'
var evenstim = '246'
var oddstim = '357'
var sides = '12'
var num_blocks = 1 //
var num_trials = 8 //per block 40 per block, randomly shuffled equal amounts of odd/even left/right, but actual number randomly drawn on each trial
var num_practice_trials = 4 //per trial type
var delays = jsPsych.randomization.shuffle(['F','O','B'])


var factors = { 
	freq: ['0.0525','0.0575','0.0675','0.0725'], 
	orient: ['35','40','50','55'], 
	bright: ['112','120','136','144']
}
var nstimuli = factors.freq.length * factors.orient.length * factors.bright.length;
var total_trials_per_block = 192;
var trial_reps_per_block = total_trials_per_block / nstimuli;

var initial_full_designF = jsPsych.randomization.factorial(factors,trial_reps_per_block,true);
var initial_full_designO = jsPsych.randomization.factorial(factors,trial_reps_per_block,true);
var initial_full_designB = jsPsych.randomization.factorial(factors,trial_reps_per_block,true);

var ts_full_design = jsPsych.randomization.factorial(factors,num_practice_trials/4,true)

var ts_num_blocks = 4;
var ts_num_trials = 192;

var ts_list = {
	stim: [],
	discrim_type: [],
	trial_type: []
}

//generate a list of s/ns 50/50
//for the s generate a list of 

for (i = 0; i++; i<ts_num_blocks) {
	//first add first trial for block
	for (j = 0; j++; j<ts_num_trials) {
		//look up type of trial, then determine stimulus from 
	}
}

//lets try generating 64 non-switch pairs and 64 of each other for each task, then randomize (how?)
var ok = 0;
const starttime = Date.now();
while (ok==0) {
	var f_stim = jsPsych.randomization.factorial(factors,4,true);
	var o_stim = jsPsych.randomization.factorial(factors,4,true);
	var b_stim = jsPsych.randomization.factorial(factors,4,true);
	var f_arr = jsPsych.randomization.repeat(['FF','O','B'],64);
	var o_arr = jsPsych.randomization.repeat(['F','OO','B'],64);
	var b_arr = jsPsych.randomization.repeat(['F','O','BB'],64);

	var arr = f_arr.concat(o_arr).concat(b_arr);

	var order = jsPsych.randomization.shuffleNoRepeats(arr);
	var order = jsPsych.randomization.shuffle(arr);
	var final_order = [];
	for (i = 0; i<order.length; i++) {
		final_order = final_order.concat(order[i].split(''));
	}

	//now measure percentages
	function check_order(order) {
		
		var last_trial = '';
		var count = [
			[0,0,0],
			[0,0,0]
			];
			
		for (i=0; i<order.length; i++) {
			var s = 1;
			if (order[i]==last_trial) {
				s=0;
			}
			if (order[i]=='F') {
				count[s][0] = count[s][0]+1;
			}
			if (order[i]=='O') {
				count[s][1] = count[s][1]+1;
			}
			if (order[i]=='B') {
				count[s][2] = count[s][2]+1;
			}
			last_trial = order[i];
		}
		return count;
	}
	var tmp = check_order(final_order);
	var totals = tmp[0].map(function (num,idx) { return num+tmp[1][idx]});
	if (Math.round(100*tmp[0][0]/totals[0])==40.0 & Math.round(100*tmp[1][0]/totals[0])==60.0) {
		if (Math.round(100*tmp[0][1]/totals[1])==40.0 & Math.round(100*tmp[1][1]/totals[1])==60.0) {
			if (Math.round(100*tmp[0][2]/totals[2])==40.0 & Math.round(100*tmp[1][2]/totals[2])==60.0) {
				ok=1;
			}
		}
	}
	//ok=1;
}
const endtime = Date.now();
endtime-starttime


var stims = [] //hold stims per block
var fixtimes = [500,600,700,800,900,1000]
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	data: {
		trial_id: "attention_check"
	},
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>'],
   rows: [15],
   columns: [60]
};

/* define static blocks */
var feedback_instruct_text =
	'<div class="block-text">Welcome to the experiment. Press <strong>enter</strong> to begin.</div>'
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction"
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox><p class = block-text>In this task, you will see two empty squares on the right and left sides of a cross in the middle of the screen. Soon after the two squares appear, one of them will be filled with a white flash. Right after the white flash, a number will appear very quickly in one of the squares and will then be covered up by a pattern.</p><p class= block-text>You should press the left arrow button if the number shown is odd (3, 5, or 7) and press the down arrow button if the number shown is even (2, 4, or 6). This task is difficult because the number only appears on the screen for a very short amount of time but try your best to guess whether the number is odd or even based on what you are able to see.</p><p class=block-text>In some of the trials in this task, the number will appear on the same side as the white flash, but in other trials the number will appear on the opposite side. You will be told before each block of trials whether the number will appear on the same side or the opposite side as the white flash.</p></div>',
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'<div class="block-text">Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.</div>'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = '<div class="block-text">Done with instructions. Press <strong>enter</strong> to continue.</div>'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
		exp_id: 'anti_saccade'
	},
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};


var start_practice_block = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Practice is coming up next. Remember, you should press the left arrow key when the number is odd, and the down arrow key when the number is even. </p><p class = block-text>During practice, you will receive feedback about whether you were correct or not. There will be no feedback during the main experiment. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};


var intertrial_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = center-text>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 0,
	timing_stim: 350,
	timing_response: 350
};

var audio = new Audio();
audio.src = "error.mp3";
audio.loop = false;

function errorDing() {
	audio.play();
}

//Set up experiment
var anti_saccade_experiment = []
anti_saccade_experiment.push(instruction_node);
anti_saccade_experiment.push(start_practice_block)

//Setup saccade practice

practice_trials = []
var practice_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "saccade practice"
	},
	text: '<div class = centerbox><p class = block-text>In these practice trials, the number will always appear on the <i>same side</i> as the white flash.</p><p class=block-text>Press <strong>enter</strong> to start practice.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};
practice_trials.push(practice_block)
	
var full_design = jsPsych.randomization.factorial(factors,num_practice_trials/4,true)

for (var i = 0; i < (num_practice_trials); i++) {
	side = full_design.side[i]
	even = full_design.even[i]
	var stim = ''
	if (even=='e') {
		stim = randomDraw(evenstim)
	} else {
		stim = randomDraw(oddstim)
	}
	stims.push(stim)
	target = stim
	if (stim%2 == 1) { 
		correct_response = 37
	} else {
		correct_response = 40
	}

	delay=1
	//var side = randomDraw(sides)
	var cuetextl = ''
	var cuetextr = ''
	if (side=='l') {
		cuetextl = '<div class="white-outer g1"></div>'
		cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
	} else {
		cuetextr = '<div class="white-outer g3"></div>'
		cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
	}
	
	var fixtime = randomDraw(fixtimes)
	var fixation_block = {
			type: 'poldrack-single-stim',
			is_html: true,
			stimulus: '<div class=centerbox><div class="container"><div class="white-outer g1"><div class="black"></div></div><div class="center-text g2">+</div><div class="white-outer g3"><div class="black"><div class="mask"></div></div></div></div></div>',
			choices: 'none',
			data: {
				trial_id: "pre-trial fixation"
			},
			timing_stim: fixtime,
			timing_response: fixtime,
			timing_post_trial: 0
	};
	var cue_block = {
			type: 'poldrack-single-stim',
			is_html: true,
			stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
			choices: 'none',
			data: {
				trial_id: "cue"
			},
			timing_stim: 400,
			timing_response: 400,
			timing_post_trial: 0
	};
	if (side=='l' & delay==1) {
		cuetextl = '<div class="white-outer g1"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
		cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
	} else if(side=='r' & delay==1) {
		cuetextr = '<div class="white-outer g3"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
		cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
	} else if(side=='l' & delay==2) {
		cuetextr = '<div class="white-outer g3"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
		cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
	} else if(side=='r' & delay==2) {
		cuetextl = '<div class="white-outer g1"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
		cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
	}
	var stim_block = {
			type: 'poldrack-single-stim',
			is_html: true,
			stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
			data: {
				trial_id: "number",
				exp_stage: "",
				stim: stim,
				target: target,
				correct_response: correct_response
			},
			choices: [37,40],
			key_answer: correct_response,
			timing_stim: 100,
			timing_response: 100,
			timing_post_trial: 0
	};
	//randomly generate mask
	var random1 = Array(50).fill(1);
	var random2 = Array(50).fill(2);
	var random = random1.concat(random2);
	var shuffled = random.map(value => ({ value, sort: Math.random()})).sort((a,b) => a.sort-b.sort).map(({ value })=> value)
	var gridtext = '';
	for (var s = 0; s<100; s++) {
		if (shuffled[s]==1) {
			gridtext = gridtext + '<div class="b">&nbsp;</div>';
		} else {
			gridtext = gridtext + '<div class="w">&nbsp;</div>';
		}
	}

	if ((side=='l' & delay==1) | (side=='r' & delay==2)) {
		cuetextl = '<div class="white-outer g1"><div class="mask">' + gridtext + '</div></div>'
		cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
	} else if ((side=='r' & delay==1) | (side=='l' & delay==2)){
		cuetextr = '<div class="white-outer g3"><div class="mask">' + gridtext + '</div></div>'
		cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
	}
	var mask_block = {
			type: 'poldrack-categorize',
			is_html: true,
			//stimulus: '<div class=centerbox><div class="container"><div class="white-outer g1"><div class="black"></div></div><div class="center-text g2">+</div><div class="white-outer g3"><div class="mask">' + gridtext + '</div></div></div></div>',
			correct_text: '<div class = centerbox><div style="color:green;font-size:60px"; class = block-text>Correct!</div></div>',
			incorrect_text: '<div class = centerbox><div style="color:red;font-size:60px"; class = block-text>Incorrect</div></div><script type="text/javascript">errorDing()</script>',
			timeout_message: '<div class = centerbox><div style="font-size:60px" class = block-text>Respond Faster!</div></div>',
			stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
			timing_feedback_duration: 500,
			show_stim_with_feedback: false,
			data: {
				trial_id: "mask",
				exp_stage: "",
				stim: stim,
				target: target,
				correct_response: correct_response
			},
			choices: [37,40],
			key_answer: correct_response,
			response_ends_trial: true,
			timing_stim: 3000,
			timing_response: 3000,
			timing_post_trial: 0				
	};
	
	practice_trials.push(fixation_block)
	practice_trials.push(cue_block)
	practice_trials.push(stim_block)
	practice_trials.push(mask_block)
	practice_trials.push(intertrial_fixation_block)
}
anti_saccade_experiment = anti_saccade_experiment.concat(practice_trials)



	
for (var d = 0; d < delays.length; d++) {
	var delay = delays[d]
	var sidetext = "error"
	var block_label = "error"
	var full_design = "error"
	if (delay=='F') {
		sidetext="frequency"
		block_label="frequency block"
		full_design = initial_full_designF
	} else if (delay=='O') {
		sidetext="orientation"
		block_label="orientation block"
		full_design = initial_full_designO
	} else {
		sidetext="brightness"
		block_label="brightness block"
		full_design = initial_full_designB
	}
	
	var start_delay_block = {
		type: 'poldrack-text',
		data: {
			trial_id: block_label
		},
		timing_response: 180000,
		text: '<div class = centerbox><p class = block-text>For the trials in this block, the number will always appear on the <i>' + sidetext + ' side</i> as the white flash.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
		cont_key: [13]
	};
	anti_saccade_experiment.push(start_delay_block)
	for (var b = 0; b < num_blocks; b++) {
			
		var target = ''
		stims = []
		for (var i = 0; i < num_trials; i++) {
			side = full_design.side[i]
			even = full_design.even[i]
			var stim = ''
			if (even=='e') {
				stim = randomDraw(evenstim)
			} else {
				stim = randomDraw(oddstim)
			}
			//var stim = randomDraw(letters)
			stims.push(stim)
			target=stim
			if (stim%2 == 1) { 
				correct_response = 37
			} else {
				correct_response = 40
			}
			//var side = randomDraw(sides)
			var cuetextl = ''
			var cuetextr = ''
			if (side=='l') {
				cuetextl = '<div class="white-outer g1"></div>'
				cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
			} else {
				cuetextr = '<div class="white-outer g3"></div>'
				cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
			}
			
			var stimtime = full_design.time[i];
			
			var fixtime = randomDraw(fixtimes)
			var fixation_block = {
					type: 'poldrack-single-stim',
					is_html: true,
					stimulus: '<div class=centerbox><div class="container"><div class="white-outer g1"><div class="black"></div></div><div class="center-text g2">+</div><div class="white-outer g3"><div class="black"><div class="mask"></div></div></div></div></div>',
					choices: 'none',
					data: {
						trial_id: "pre-trial fixation"
					},
					timing_stim: fixtime,
					timing_response: fixtime,
					timing_post_trial: 0
			};
			var cue_block = {
					type: 'poldrack-single-stim',
					is_html: true,
					stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
					choices: 'none',
					data: {
						trial_id: "cue"
					},
					timing_stim: 400,
					timing_response: 400,
					timing_post_trial: 0
			};
			if (side=='l' & delay==1) {
				cuetextl = '<div class="white-outer g1"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
				cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
			} else if(side=='r' & delay==1) {
				cuetextr = '<div class="white-outer g3"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
				cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
			} else if(side=='l' & delay==2) {
				cuetextr = '<div class="white-outer g3"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
				cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
			} else if(side=='r' & delay==2) {
				cuetextl = '<div class="white-outer g1"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
				cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
			}
			var stim_block = {
					type: 'poldrack-single-stim',
					is_html: true,
					stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
					data: {
						trial_id: "number",
						exp_stage: "",
						stim: stim,
						target: target,
						correct_response: correct_response,
					},
					choices: [37,40],
					key_answer: correct_response,
					timing_stim: stimtime,
					timing_response: stimtime,
					timing_post_trial: 0
			};
						
			anti_saccade_experiment.push(fixation_block)
			anti_saccade_experiment.push(cue_block)
			anti_saccade_experiment.push(stim_block)
			anti_saccade_experiment.push(intertrial_fixation_block)
		}
	}
}
anti_saccade_experiment.push(post_task_block)
anti_saccade_experiment.push(end_block)