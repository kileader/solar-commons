init -2 python:
    gui.init(1600, 900)

define config.name = "Solar Commons"
define config.version = "0.2.0"
define build.name = "SolarCommons"
define config.save_directory = "SolarCommons-2026"
define config.window_title = "Solar Commons"
define config.has_sound = True
define config.has_music = True
define config.has_voice = False
define config.default_music_volume = 0.55
define config.default_sfx_volume = 0.65
define config.enter_transition = Dissolve(0.15)
define config.exit_transition = Dissolve(0.15)
define config.window = "auto"
define config.rollback_enabled = True
define config.history_length = 200
define config.default_text_cps = 0
define config.check_conflicting_properties = True
define config.autosave_on_choice = True
define config.main_menu_music = "audio/commons.ogg"
define config.web_video_base = ""

default persistent.reduce_motion = False
default persistent.large_text = False

init python:
    # Keep SDKs, tests, source masters and the superseded browser prototype out of releases.
    build.classify("game/tests/**", None)
    build.classify("game/cache/**", None)
    build.classify("game/saves/**", None)
    build.classify("game/**.rpy", None)
    build.classify("game/**.rpyc", "all")
    build.classify("game/**", "all")
    build.classify("**", None)
