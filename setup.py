from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

from itc_org_frappe import __version__ as version

setup(
	name="itc_org_frappe",
	version=version,
	description="ITC Org Frappe App",
	author="ITChamps",
	author_email="",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
