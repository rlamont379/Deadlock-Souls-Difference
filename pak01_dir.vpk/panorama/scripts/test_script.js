const POLL_INTERVAL = 1;
const DEBUG = false;

(function () {
	'use strict';

	function Debug(message) {
		if (DEBUG) {
			$.Msg('[SoulsDifference] ' + message);
		}
	}

	function GetGold(panel) {
		var label = panel.FindChildTraverse('SoulsValue');
		if (!label) {
			Debug(panel.id + ': SoulsValue not found');
			return null;
		}

		var text = label.text;

		// Use the game's integer gold formatter.
		var formatted = $.Localize('{i:gold}', panel);

		Debug(panel.id + ': SoulsValue.text="' + text + '"');

		Debug(panel.id + ': {i:gold} = "' + formatted + '"');

		// Remove commas and parse the actual integer value.
		var value = parseInt(formatted.replace(/,/g, ''), 10);

		Debug(panel.id + ': parsed gold=' + value);

		if (isNaN(value)) {
			return null;
		}

		return value;
	}

	function Update() {
		var panel = $.GetContextPanel();

		Debug('----------------------------------------');

		Debug('Update: context=' + panel.id + ' type=' + panel.paneltype);

		var root = panel;

		while (root.GetParent() !== null) {
			root = root.GetParent();
		}

		Debug('Root=' + root.id + ' type=' + root.paneltype);

		var localPlayers = root.FindChildrenWithClassTraverse('LocalPlayer');

		Debug(
			'LocalPlayer panels found=' + (localPlayers ? localPlayers.length : 0),
		);

		if (!localPlayers || localPlayers.length === 0) {
			Debug('No LocalPlayer panels found; retrying');
			$.Schedule(0.1, Update);
			return;
		}

		for (var i = 0; i < localPlayers.length; i++) {
			Debug(
				'LocalPlayer[' +
					i +
					']=' +
					localPlayers[i].id +
					' type=' +
					localPlayers[i].paneltype,
			);
		}

		var localGold = GetGold(localPlayers[0]);
		var theirGold = GetGold(panel);

		Debug('RESULT: localGold=' + localGold + ' theirGold=' + theirGold);

		if (localGold !== null && theirGold !== null) {
			var difference = theirGold - localGold;

			Debug(
				'CALCULATION: ' + theirGold + ' - ' + localGold + ' = ' + difference,
			);

			// Absolute difference.
			panel.SetDialogVariableInt('soul_difference', difference);

			Debug('SetDialogVariableInt("soul_difference", ' + difference + ')');

			// Percentage difference relative to our souls.
			var percentageDifference = 0;

			if (localGold > 0) {
				percentageDifference = (difference / localGold) * 100;
			}

			Debug('PERCENTAGE: ' + percentageDifference + '%');

			panel.SetDialogVariableInt('soul_difference_percentage', Math.round(percentageDifference));
			
			Debug(
				'SetDialogVariable("soul_difference_percentage", "' +
					Math.round(percentageDifference) +
					'")',
			);
		}

		$.Schedule(POLL_INTERVAL, Update);
	}

	Update();
})();
