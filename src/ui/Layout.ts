/** ゲーム画面全体のレイアウト定数（スマホ縦持ちを基準にした論理解像度）。 */
export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export const REEL_WINDOW_TOP = 230;
export const REEL_ROW_HEIGHT = 118;
export const REEL_WIDTH = 150;
export const REEL_GAP = 16;
export const REEL_X_POSITIONS = [40, 40 + REEL_WIDTH + REEL_GAP, 40 + (REEL_WIDTH + REEL_GAP) * 2];
export const SYMBOL_SIZE = 96;

export const LAMP_X = 640;
export const LAMP_Y = REEL_WINDOW_TOP + (REEL_ROW_HEIGHT * 3) / 2;
export const LAMP_RADIUS = 46;

export const HUD_TOP = 20;

export const WIN_BANNER_Y = REEL_WINDOW_TOP + REEL_ROW_HEIGHT * 3 + 40;

export const CONTROL_PANEL_TOP = 860;
export const BUTTON_ROW_1_Y = CONTROL_PANEL_TOP + 40;
export const BUTTON_ROW_2_Y = CONTROL_PANEL_TOP + 170;
export const LEVER_Y = CONTROL_PANEL_TOP + 320;
