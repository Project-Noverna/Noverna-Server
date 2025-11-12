fx_version 'cerulean'
game 'gta5'

name 'noverna-core'
author 'Noverna'
version '1.0.0'
description 'Noverna Core Resource'

-- Dependency examples (uncomment/add as needed)
-- dependency 'mapmanager'
-- dependency 'sessionmanager'

-- Shared scripts (config, utilities)
shared_scripts {
	-- 'build/shared/**/*.js'
}

-- Client scripts (compiled TypeScript output)
client_scripts {
	'build/client/**/*.js'
}

-- Server scripts (compiled TypeScript output)
server_scripts {
	'build/server/**/*.js'
}

-- Lua scripts if you add any later
-- lua54 'yes'
