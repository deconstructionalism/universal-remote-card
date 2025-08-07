import { PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseKeyboard } from './base-keyboard';

const pause = (delay: number) =>
	new Promise((resolve) => setTimeout(resolve, delay));

@customElement('android-tv-keyboard')
export class AndroidTVKeyboard extends BaseKeyboard {
	keyMap = {
		Backspace: 'DEL',
		Enter: 'ENTER',
	};
	inputMap = {
		deleteContentBackward: 'DEL',
		insertLineBreak: 'ENTER',
	};

	sendText(text: string) {
		this.hass.callService('remote', 'send_command', {
			entity_id: this.action.remote_id,
			command: `text:${text}`,
		});
	}

	sendKey(key: string) {
		this.hass.callService('remote', 'send_command', {
			entity_id: this.action.remote_id,
			command: key,
		});
	}

	sendSearch(text: string) {
		console.log('inside sendSearch', text);
		if (!this.searchReady) {
			console.log('Search not ready');
			setTimeout(() => {
				console.log('sent search after timeout', text);
				this.sendSearch(text);
			}, 100);
			return;
		}

		const payload = {
			entity_id: this.action.remote_id,
			command: [`text:${text}`, 'ENTER'],
			delay_secs: 0.4,
		};
		console.log('this.hass.callService payload');

		this.hass.callService('remote', 'send_command', {
			entity_id: this.action.remote_id,
			command: [`text:${text}`, 'ENTER'],
			delay_secs: 0.4,
		});
	}

	async updated(changedProperties: PropertyValues) {
		super.updated(changedProperties);
		if (
			changedProperties.has('open') &&
			!changedProperties.get('open') &&
			this.open &&
			this.action.action == 'search'
		) {
			this.searchReady = false;

			await this.hass.callService('remote', 'send_command', {
				entity_id: this.action.remote_id,
				command: 'SEARCH',
			});

			await pause(1000);

			await this.hass.callService('remote', 'send_command', {
				entity_id: this.action.remote_id,
				command: ['DPAD_LEFT', 'DPAD_LEFT', 'DPAD_CENTER'],
				delay_secs: 0.4,
			});

			await pause(1000);

			await this.hass.callService('remote', 'sendCommand', {
				entity_id: this.action.remote_id,
				command: ['BACK'],
			});

			this.searchReady = true;
		}
	}
}

