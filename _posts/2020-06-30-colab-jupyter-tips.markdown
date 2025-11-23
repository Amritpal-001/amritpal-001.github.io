---
title:  "Colab Jupyter Notebook Tips"
date:   2020-06-30 05:30:03 +0530
tags:
  - coding
  - old
---
=======================


# Colab Jupyter Notebook Tips

![](https://amritpal001.files.wordpress.com/2020/06/google-colab.png?w=300)

**Magics**
----------

Manage environment variables

%env NUM\_THREAD# Measure entire block  
%%time  
\# Measure a single line  
%timeit func()

Get details

%timeit?  
list?

Measure execution time

\# Measure entire block  
%%time  
\# Measure a single line  
%timeit func()

**Autoreload**
--------------

If you edit the code of an imported module or package, you usually need to restart the notebook kernel or use reload() on the specific module. That can be quite annoying. With the [**autoreload**](https://ipython.org/ipython-doc/3/config/extensions/autoreload.html) magic command, modules are automatically reloaded before any of their code is executed.

_%load\_ext autoreload  
%autoreload 2_

Execute other python/notebook

\# Excute code in demo.ipynb (can be .py)  
%run ./demo.ipynb  
\# Load content in demo.py to the cell  
%load ./demo.py

Store data between notebooks

data = ‘this is the string I want to pass to different notebook’  
%store data  
del data

\# Read \`data\` in another notebook  
%store -r data # variable name must be the same

Write cell code to python file

%%writefile pythoncode.py  
import numpy  
def append\_if\_not\_exists(arr, x):  
if x not in arr:  
arr.append(x)

def some\_useless\_slow\_function():  
arr = list()  
for i in range(10000):  
x = numpy.random.randint(0, 10000)  
append\_if\_not\_exists(arr, x)

Display file content

%pycat pythoncode.py

Profiling

\# Profile run time  
%prun func()

\# Profile run time by line  
\# !pip install line\_profiler  
%load\_ext line\_profiler  
%lprun func()

\# Profile memory  
\# !pip install memory\_profiler  
%load\_ext memory\_profiler  
%mprun func()

\# Measure the memory use of a single statement  
%memit func()

Use other kernels for the cell

%%python2  
%%python3  
%%ruby  
%%perl  
%%bash  
%%R

**[#](https://j0e1in.github.io/dev_notes/ml/tools/jupyter-tips.html#tools) Tools**
----------------------------------------------------------------------------------

Write fast code using Cython

!pip install cython  
%load\_ext Cython

%%cython  
def myltiply\_by\_2(float x):  
return 2.0 \* x

myltiply\_by\_2(23.) # 46.0

Install Jupyter Contrib Extensions

pip install [https://github.com/ipython-contrib/jupyter\_contrib\_nbextensions/tarball/master](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tarball/master)  
pip install jupyter\_nbextensions\_configurator  
jupyter contrib nbextension install –user  
jupyter nbextensions\_configurator enable –user

RISE: jupyter notebook presentation

conda install -c damianavila82 rise # recommended  
pip install RISE # less recommended

Display media

from IPython.display import display, Image  
display(Image(‘demo.jpg’))

Connect Github to [Binder](https://mybinder.org/)

to display notebooks to others

**Upload / Download Files**
---------------------------

If you want to upload / download files via browser, you can use Colab’s python API.

from google.colab import files  
files.download(‘file\_path’)  
files.upload() # will display an upload button

**Use Google Drive as Data Storage**
------------------------------------

Every time you open a notebook, Google starts a new docker container, so everything will be lost once the notebook tab is closed. As a result, you want to retain your training results. The good news is you can mount your Google drive as an external disk onto Colab container! Even better, you can upload dataset to Google Drive and use it directly from Colab after mounting it.

To mount Google Drive, just execute following script in Colab notebook:

(This section will ask for access permission to Google Drive.)

\# Setup authentication to mount Google Drive  
!apt-get install -y -qq software-properties-common python-software-properties module-init-tools  
!add-apt-repository -y ppa:alessandro-strada/ppa 2>&1 > /dev/null  
!apt-get update -qq 2>&1 > /dev/null  
!apt-get -y install -qq google-drive-ocamlfuse fuse

from google.colab import auth  
auth.authenticate\_user()  
from oauth2client.client import GoogleCredentials  
creds = GoogleCredentials.get\_application\_default()  
import getpass  
!google-drive-ocamlfuse -headless -id={creds.client\_id} -secret={creds.client\_secret} &1 | grep URL  
vcode = getpass.getpass()  
!echo {vcode} | google-drive-ocamlfuse -headless -id={creds.client\_id} -secret={creds.client\_secret}

After gaining permission, you can mount Google Drive with following script:

\# Execute when running on colab  
\# Mount Google Drive  
!mkdir -p drive  
!google-drive-ocamlfuse drive

import os  
os.chdir(‘drive/Colab Notebooks’)

Now your working directory is the Colab Notebooks directory in your Google Drive

**Tensorboard**
---------------

Run tensorboard with – tensorboard _–logdir path/to/logdir_

tf.summary.histogram(‘pred’, output)  
tf.summary.scalar(‘loss’, loss) # add loss to scalar summary  
merge\_op = tf.summary.merge\_all()  
writer = tf.summary.FileWriter(‘./log’, sess.graph) # write to file

for step in range(100):  
\# train and net output  
\_, result = sess.run(\[train\_op, merge\_op\], {tf\_x: x, tf\_y: y})  
writer.add\_summary(result, step)

Debugging Python code using breakpoint() and pdb
================================================

%debug # launch ipdb debugger  
%pdb # set breakpoint (== \`import ipdb; ipdb.set\_trace()\`)

**Syntax:**

breakpoint() # in Python 3.7

\# OR

import pdb; pdb.set\_trace() # in Python 3.6 and below.

Python comes with the latest built-in function _breakpoint_ which do the same thing as pdb.set\_trace() in Python 3.6 and below versions. Debugger finds the bug in the code line by line where we add the breakpoint, if a bug is found then program stops temporarily then you can remove the error and start to execute the code again.

The easiest way to debug a Jupyter notebook is to use the **%debug magic** command. Whenever you encounter an error or exception, just open a new notebook cell, type %debug and run the cell. This will open a command line where you can test your code and inspect all variables right up to the line that threw the error.

Type **“n”** and hit Enter to run the **next** **line** of code (The → arrow shows you the current position). Use **“c”** to **continue** until the next breakpoint. **“q”** **quits** the debugger and code execution.

Since i use python 3.7 mostly, hence i will discuss the Breakpoint only!

def debugger(a, b):  
breakpoint()  
result = a / b  
return resultprint(debugger(5, 0))

**Output :**

**![](https://amritpal001.files.wordpress.com/2020/06/null-1.png?w=601&h=86)**

In order to run the debugger just type **c** and press enter.

![](https://amritpal001.files.wordpress.com/2020/06/null-2.png?w=601&h=205)

**Commands for debugging :**

c -> continue execution  
q -> quit the debugger/execution  
n -> step to next line within the same function  
s -> step to next line in this function or a called function

**iPython debugger** is another great option. Import it and use set\_trace() anywhere in your notebook to create one or multiple breakpoints. When executing a cell, it will stop at the first breakpoint and open the command line for code inspection. You can also set breakpoints in the code of imported modules, but don’t forget to import the debugger in there as well.

_from IPython.core.debugger import set\_trace  
set\_trace()_

**PixieDebugger**

As a prerequisite, install PixieDust using the following pip command: pip install pixiedust. You’ll also need to import it into its own cell: import pixiedust.

pip install pixiedust  
import pixiedust

To invoke the PixieDebugger for a specific cell, simply add the **%%pixie\_debugger** magic at the top of the cell and run it. Detailed tutorial at – [https://medium.com/codait/the-visual-python-debugger-for-jupyter-notebooks-youve-always-wanted-761713babc62](https://medium.com/codait/the-visual-python-debugger-for-jupyter-notebooks-youve-always-wanted-761713babc62)

Original articles – [https://j0e1in.github.io/dev\_notes/ml/tools/jupyter-colab.html#use-google-drive-as-data-storage](https://j0e1in.github.io/dev_notes/ml/tools/jupyter-colab.html#use-google-drive-as-data-storage)

Debugging

*   Breakpoints and pdb – [https://www.geeksforgeeks.org/debugging-python-code-using-breakpoint-and-pdb/](https://www.geeksforgeeks.org/debugging-python-code-using-breakpoint-and-pdb/)
*   PixieDebugger – [https://medium.com/codait/the-visual-python-debugger-for-jupyter-notebooks-youve-always-wanted-761713babc62](https://medium.com/codait/the-visual-python-debugger-for-jupyter-notebooks-youve-always-wanted-761713babc62)
*   [https://medium.com/@chrieke/jupyter-tips-and-tricks-994fdddb2057](https://medium.com/@chrieke/jupyter-tips-and-tricks-994fdddb2057)


[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
