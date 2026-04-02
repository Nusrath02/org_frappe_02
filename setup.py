from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# Read version without importing the package (avoids import errors in clean build envs)
version = "0.0.1"
with open("itc_org_frappe/__init__.py") as f:
	for line in f:
		if line.startswith("__version__"):
			version = line.split("=")[1].strip().strip('"').strip("'")
			break

setup(
	name="itc_org_frappe",
	version=version,
	description="ITC Org Frappe App",
	author="ITChamps",
	author_email="",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires,
)
