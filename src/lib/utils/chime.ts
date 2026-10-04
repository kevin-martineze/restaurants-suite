/**
 * El aviso sonoro de pedido nuevo, sintetizado con Web Audio: dos tonos cortos
 * y claros que se oyen en una cocina con ruido, sin archivos de audio.
 *
 * El navegador solo deja sonar después de que la persona toca algo en la
 * página; por eso el panel tiene el botón "Activar sonido".
 */
let context: AudioContext | null = null;

function tone(ctx: AudioContext, frequency: number, start: number, duration: number): void {
	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();

	oscillator.type = 'triangle';
	oscillator.frequency.value = frequency;
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
	oscillator.connect(gain).connect(ctx.destination);
	oscillator.start(start);
	oscillator.stop(start + duration);
}

/** Desbloquea el audio. Hay que llamarlo desde un toque de la persona. */
export async function unlockChime(): Promise<void> {
	context ??= new AudioContext();

	if (context.state === 'suspended') await context.resume();
}

export function playChime(): void {
	if (!context || context.state !== 'running') return;

	const now = context.currentTime;

	tone(context, 880, now, 0.25);
	tone(context, 1320, now + 0.22, 0.35);
}
