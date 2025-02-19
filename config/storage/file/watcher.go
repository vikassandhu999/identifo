package file

import (
	"log"

	"github.com/fsnotify/fsnotify"
	"github.com/madappgang/identifo/v2/model"
)

type Watcher struct {
	file       string
	change     chan bool
	err        chan error
	done       chan bool
	isWatching bool
}

func NewWatcher(file string) model.ConfigurationWatcher {
	return &Watcher{
		file:       file,
		change:     make(chan bool),
		err:        make(chan error),
		done:       make(chan bool),
		isWatching: false,
	}
}

func (w *Watcher) Watch() {
	// non blocking run of watch function
	go w.runWatch()
}

// blocking version of Watch
func (w *Watcher) runWatch() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		w.err <- err
		return
	}
	watcher.Add(w.file)
	w.isWatching = true
	defer func() {
		watcher.Close()
		w.isWatching = false
	}()

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			log.Println("file watcher event:", event)
			if (event.Op&fsnotify.Write == fsnotify.Write) ||
				(event.Op&fsnotify.Create == fsnotify.Create) {
				log.Println("file watched handled modified file:", event.Name)
				w.change <- true
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("file watcher error:", err)
			w.err <- err
		case <-w.done:
			log.Println("file watcher received signal to stop watching")
		}
	}
}

func (w *Watcher) IsWatching() bool {
	return w.isWatching
}

func (w *Watcher) WatchChan() <-chan bool {
	return w.change
}

func (w *Watcher) ErrorChan() <-chan error {
	return w.err
}

func (w *Watcher) Stop() {
	// non blocking stop
	go func() {
		w.done <- true
	}()
}
