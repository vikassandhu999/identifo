package model

// ConfigurationWatcher is a server configuration watcher.
type ConfigurationWatcher interface {
	Watch()
	IsWatching() bool
	WatchChan() <-chan bool
	ErrorChan() <-chan error
	Stop()
}
