import { PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseKeyboard } from './base-keyboard';

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
		console.log('inside sendSearch', text)
		if (!this.searchReady) {
			console.log('Search not ready')
			setTimeout(() => {
				console.log('sent search after timeout', text)
				this.sendSearch(text);
			}, 100);
			return;
		}

		const payload = {
			entity_id: this.action.remote_id,
			command: [`text:${text}`, 'ENTER'],
			delay_secs: 0.4,
		}
		console.log('this.hass.callService payload', payload)

		this.hass.callService('remote', 'send_command', payload);
	}

	updated(changedProperties: PropertyValues) {
		super.updated(changedProperties);
		if (
			changedProperties.has('open') &&
			!changedProperties.get('open') &&
			this.open &&
			this.action.action == 'search'
		) {
			this.searchReady = false;
			this.hass
				.callService('remote', 'send_command', {
					entity_id: this.action.remote_id,
					command: 'SEARCH',
				})
				.then(() => {
					setTimeout(
						() =>
							this.hass
								.callService('remote', 'send_command', {
									entity_id: this.action.remote_id,
									command: [
										'DPAD_LEFT',
										'DPAD_LEFT',
										'DPAD_CENTER',
									],
									delay_secs: 0.4,
								})
								.then(() => (this.searchReady = true)),
						1000,
					);
				});
		}
	}
}
