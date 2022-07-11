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

//Calculates whether the last trial was correct and records the accuracy in data object
var record_acc = function() {
	var global_trial = jsPsych.progress().current_trial_global
	var stim = jsPsych.data.getData()[global_trial].stim.toLowerCase()
	var target = jsPsych.data.getData()[global_trial].target.toLowerCase()
	var key = jsPsych.data.getData()[global_trial].key_press
	if (stim == target && key == 37) {
		correct = true
	} else if (stim != target && key == 40) {
		correct = true
	} else {
		correct = false
	}
	jsPsych.data.addDataToLastTrial({
		correct: correct,
		trial_num: current_trial
	})
	current_trial = current_trial + 1
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
var sides = '12'
var num_blocks = 1 //
var num_trials = 40 //per block
var num_practice_trials = 1 //per trial type
var delays = jsPsych.randomization.shuffle([1,1,1,2,2,2])
var control_before = Math.round(Math.random()) //0 control comes before test, 1, after
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
	'Welcome to the experiment. Press <strong>enter</strong> to begin.'
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
		'<div class = centerbox><p class = block-text>In this experiment you will see a sequence of letters presented one at a time. Your job is to respond by pressing the <strong>left arrow key</strong> when the letter matches the same letter that occured either 1, 2 or 3 trials before, otherwise you should press the <strong>down arrow key</strong>. The letters will be both lower and upper case. You should ignore the case (so "t" matches "T")</p><p class = block-text>The specific delay you should pay attention to will differ between blocks of trials, and you will be told the delay before starting a trial block.</p><p class = block-text>For instance, if the delay is 2, you are supposed to press the left arrow key when the current letter matches the letter that occured 2 trials ago. If you saw the sequence: g...G...v...T...b...t...b, you would press the left arrow key on the last "t" and the last "b" and the down arrow key for every other letter.</p><p class = block-text>On one block of trials there will be no delay. On this block you will be instructed to press the left arrow key to the presentation of a specific letter on that trial. For instance, the specific letter may be "t", in which case you would press the left arrow key to "t" or "T".</p></div>',
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
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
		exp_id: 'n_back'
	},
	text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};


var start_practice_block = {
	type: 'poldrack-text',
	text: '<div class = centerbox><p class = block-text>Starting practice. During practice, you should press the left arrow key when the current letter matches the letter that appeared 1 trial before. Otherwise press the down arrow key</p><p class = center-block-text>You will receive feedback about whether you were correct or not during practice. There will be no feedback during the main experiment. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	data: {
		trial_id: "instruction"
	},
	timing_response: 180000,
	timing_post_trial: 1000
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro"
	},
	timing_response: 180000,
	text: '<div class = centerbox><p class = center-block-text>Starting a test block.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};

var start_control_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "control_intro"
	},
	text: '<div class = centerbox><p class = block-text>In this block you do not have to match letters to previous letters. Instead, press the left arrow key everytime you see a "t" or "T" and the down arrow key for all other letters.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000
};


var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation></div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 0,
	timing_stim: 350,
	timing_response: 350,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	},
};

//Setup 1-back practice
practice_trials = []
for (var i = 0; i < (num_practice_trials); i++) {
	var stim = randomDraw(letters)
	stims.push(stim)
	if (i >= 1) {
		target = stims[i - 1]
	}
	if (stim == target) { 
		correct_response = 37
	} else {
		correct_response = 40
	}
	var practice_block = {
		type: 'poldrack-categorize',
		is_html: true,
		stimulus: '<div class = centerbox><div class = center-text>' + stim + '</div></div>',
		key_answer: correct_response,
		data: {
			trial_id: "stim",
			exp_stage: "practice",
			stim: stim,
			target: target
		},
		correct_text: '<div class = centerbox><div style="color:green;font-size:60px"; class = center-text>Correct!</div></div>',
		incorrect_text: '<div class = centerbox><div style="color:red;font-size:60px"; class = center-text>Incorrect</div></div>',
		timeout_message: '<div class = centerbox><div style="font-size:60px" class = center-text>Respond Faster!</div></div>',
		timing_feedback_duration: 500,
		show_stim_with_feedback: false,
		choices: [37,40],
		timing_stim: 500,
		timing_response: 2000,
		timing_post_trial: 500
	};
	practice_trials.push(practice_block)
}

//Define control (0-back) block
var control_trials = []
for (var i = 0; i < num_trials; i++) {
	var stim = randomDraw(letters)
	var control_block = {
		type: 'poldrack-single-stim',
		is_html: true,
		stimulus: '<div class = centerbox><div class = center-text>' + stim + '</div></div>',
		data: {
			trial_id: "stim",
			exp_stage: "test",
			load: 0,
			stim: stim,
			target: 't'
		},
		choices: [37,40],
		timing_stim: 500,
		timing_response: 2000,
		timing_post_trial: 0,
		on_finish: record_acc
	};
	control_trials.push(control_block)
}

//Set up experiment
var n_back_experiment = []
n_back_experiment.push(instruction_node);
n_back_experiment.push(start_practice_block)
n_back_experiment = n_back_experiment.concat(practice_trials)

for (var d = 0; d < delays.length; d++) {
	var delay = delays[d]
	var sidetext = "error"
	if (delay==1) {
		sidetext="same"
	} else {
		sidetext="opposite"
	}
	var start_delay_block = {
		type: 'poldrack-text',
		data: {
			trial_id: "saccade_text"
		},
		timing_response: 180000,
		text: '<div class = centerbox><p class = block-text>In the next block, the target number will appear on the ' + sidetext + ' side of the screen from the cue</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
		cont_key: [13]
	};
	n_back_experiment.push(start_delay_block)
	for (var b = 0; b < num_blocks; b++) {
		n_back_experiment.push(start_test_block)
		var target = ''
		stims = []
		for (var i = 0; i < num_trials; i++) {
			var stim = randomDraw(letters)
			stims.push(stim)
			if (stim==2) {
				target=37
			} else {
				target=40
			}
			var side = randomDraw(sides)
			var cuetextl = ''
			var cuetextr = ''
			if (side==1) {
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
			if (side==1) {
				cuetextl = '<div class="white-outer g1"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
				cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
			} else {
				cuetextr = '<div class="white-outer g3"><div class="black"><div class="center-div-text">'+stim+'</div></div></div>'
				cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
			}
			var stim_block = {
					type: 'poldrack-single-stim',
					is_html: true,
					stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
					data: {
						trial_id: "number",
						exp_stage: "",
						stim: stim,
						target: target
					},
					choices: [37,40],
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
			if (side==1) {
				cuetextl = '<div class="white-outer g1"><div class="mask">' + gridtext + '</div></div>'
				cuetextr = '<div class="white-outer g3"><div class="black"></div></div>'
			} else {
				cuetextr = '<div class="white-outer g3"><div class="mask">' + gridtext + '</div></div>'
				cuetextl = '<div class="white-outer g1"><div class="black"></div></div>'
			}
			var mask_block = {
					type: 'poldrack-single-stim',
					is_html: true,
					//stimulus: '<div class=centerbox><div class="container"><div class="white-outer g1"><div class="black"></div></div><div class="center-text g2">+</div><div class="white-outer g3"><div class="mask">' + gridtext + '</div></div></div></div>',
					stimulus: '<div class=centerbox><div class="container">' + cuetextl + '<div class="center-text g2">+</div>' + cuetextr + '</div></div>',
					choices: 'none',
					data: {
						trial_id: "mask",
						exp_stage: "",
						stim: stim,
						target: target
					},
					choices: [37,40],
					timing_stim: 3000,
					timing_response: 3000,
					timing_post_trial: 0				
			};
			
			n_back_experiment.push(fixation_block)
			n_back_experiment.push(cue_block)
			n_back_experiment.push(stim_block)
			n_back_experiment.push(mask_block)
			n_back_experiment.push(fixation_block)
		}
	}
}
n_back_experiment.push(post_task_block)
n_back_experiment.push(end_block)