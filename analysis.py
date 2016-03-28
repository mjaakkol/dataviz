#!/usr/bin/python
import os
import pandas


"""
Cleaning activities:
1. Remove invalid colums for this data analysis (keep potentially needed items). This is done manually using excel
2. Add extrapolated entries for included columns having NULL parameters and if still not valid filter them.
3. Remove 00:00 from loan origination date.
4. Merge credit ranges into one category

"""

df = pandas.read_csv(os.path.join("data","prosperLoanData.csv"))

# We want to drop unnecessary info and as it seems that the data has been stripped from 
# the set compared to what the dictionary key says, I decided to ignore any values that raise
# an error
df = df.drop(dropped_list, errors='ignore')
print(df.describe())


	
