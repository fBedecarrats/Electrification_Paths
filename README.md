# Requirements

Please... recent-ish versions of

- PostgreSQL
- Ruby
- A web browser ()

# Installing everyhing

## PostgreSQL

Postgres installation varies to much depending on your OS. Here are some ideas:

- [ArchLinux](https://wiki.archlinux.org/index.php/PostgreSQL)
- [MacOSX](http://www.postgresql.org/download/macosx/)


## Ruby

Ruby will handle the web-server and populating the database. Ruby is
generally installed in any decent OS.

After Ruby is installed you will have access to ``rake`` and ``gem``.

``rake`` stands for *ruby make*. It's for running tasks.

``gem`` is a package manager. (equivalent to *npm* in node; or *env* in python).


__Bundler__ is a library that will help wrap (bundle) the Ruby dependencies
so that within this project directory instead of modifying the system
or setting user's configurations.

Go into the directory where this README file is located and type:

    $ gem install bundler

Sometimes you need to re-open your terminal for changes to take effect.

Now we tell __bundler__ to read de Gemfile and install everything. You
will see a ``vendor`` directory after doing this. All dependencies
will be installed there.

    $ bundle install


## Populating the database

Simply run (it'll try to drop the database even if it doesn't exist)
and follow instructions... Creating 250,000 grids took about 2.5
minutes on my computer.

    $ bundle exec rake db:restore

**NOTE:** To speed things up we're using a single DB transaction so if
you interrupt it, no grids will be generated.


## Windows?

You're on your own. Good luck...


# Usage

Luckily everything is running smoothly. There are several ways that'll get
you started. You can see rake tasks described with:

    $ bundle exec rake help


## IRB Console

We'll save interesting queries in ``./db/utils.rb``. For example
the function definitions of ``get_grid_count_by_country`` and
``get_grids_around`` to get some examples of how querying with
Ruby Sequel is like (which is awesome).


## Web Server

Startup the server with

    $ bundle exec rake api:run

Open a web browser and go to
[http://localhost:3000/](http://localhost:3000/). You'll get
more instructions there.
